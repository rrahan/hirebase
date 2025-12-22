
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { db } = require('../config/db');
const { rawjobs } = require('../schema/rawjobs');
const { jobs } = require('../schema/jobs');
const { companies } = require('../schema/companies');
const { eq, ilike, sql } = require('drizzle-orm');
const { cleanCompanyName } = require('../utils/companyCleaner');
const { SYSTEM_PROMPT } = require('../config/jobCleanerPrompt');

// OpenRouter API configuration
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL;

// Helper to delay for rate limits
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Normalizes a single job using OpenRouter AI
 * @param {Object} rawJob 
 * @returns {Promise<Object|null>}
 */
async function cleanAndNormalizeJob(rawJob) {
    try {
        const prompt = SYSTEM_PROMPT.replace('{{RAW_DATA}}', JSON.stringify(rawJob, null, 2));

        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'https://hirebase.xyz',
                'X-Title': 'Hirebase Job Cleaner'
            },
            body: JSON.stringify({
                model: OPENROUTER_MODEL,
                messages: [
                    { role: 'system', content: prompt }
                ],
                temperature: 0.1,
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) throw new Error('No content from OpenRouter');

        return JSON.parse(content);
    } catch (error) {
        console.error(`[JobCleanerV2] Error normalizing job ${rawJob.job_id}:`, error.message);
        return null;
    }
}

/**
 * Normalizes company name for better matching
 * @param {string} name - The company name
 * @returns {string} - Normalized name
 */
function normalizeForMatching(name) {
    if (!name) return '';

    return name
        .replace(/\s+dot\s+/gi, '.')      // "Way Dot Com" -> "Way.Com"
        .replace(/\s+dot$/gi, '.')         // trailing "dot"
        .replace(/^dot\s+/gi, '.')         // leading "dot"
        .replace(/\s+/g, ' ')              // normalize spaces
        .trim();
}

/**
 * Matches a company by name against companies.name
 * @param {string} companyName - The company name from raw job or AI-cleaned
 * @returns {Promise<Object|null>} - The matched company or null
 */
async function matchCompanyByName(companyName) {
    if (!companyName) return null;

    try {
        // Clean the company name (remove Pvt Ltd, Inc, etc.)
        let cleanedName = cleanCompanyName(companyName);
        // Also normalize for matching (Dot -> .)
        cleanedName = normalizeForMatching(cleanedName);

        // 1. Try exact match (case-insensitive)
        let matchedCompanies = await db
            .select()
            .from(companies)
            .where(sql`LOWER(${companies.name}) = LOWER(${cleanedName})`);

        if (matchedCompanies.length > 0) {
            console.log(`[JobCleanerV2] Exact match: ${matchedCompanies[0].name} for "${cleanedName}"`);
            return matchedCompanies[0];
        }

        // 2. Try contains match (DB company name contains our search)
        matchedCompanies = await db
            .select()
            .from(companies)
            .where(ilike(companies.name, `%${cleanedName}%`));

        if (matchedCompanies.length > 0) {
            console.log(`[JobCleanerV2] Contains match: ${matchedCompanies[0].name} for "${cleanedName}"`);
            return matchedCompanies[0];
        }

        // 3. Try reverse contains (our search contains DB company name)
        // This handles "Feathersoft Info Solutions" matching "Feathersoft"
        const allCompanies = await db.select().from(companies);
        const lowerCleanedName = cleanedName.toLowerCase();

        for (const company of allCompanies) {
            const companyNameLower = company.name.toLowerCase();
            if (lowerCleanedName.includes(companyNameLower) || companyNameLower.includes(lowerCleanedName)) {
                console.log(`[JobCleanerV2] Reverse contains match: ${company.name} for "${cleanedName}"`);
                return company;
            }
        }

        // 4. Try first word match only (e.g., "Feathersoft Info Solutions" -> "Feathersoft")
        const firstWord = cleanedName.split(/\s+/)[0];
        if (firstWord && firstWord.length > 3) {
            matchedCompanies = await db
                .select()
                .from(companies)
                .where(ilike(companies.name, `${firstWord}%`));

            if (matchedCompanies.length > 0) {
                console.log(`[JobCleanerV2] First-word match: ${matchedCompanies[0].name} for "${firstWord}"`);
                return matchedCompanies[0];
            }
        }

        console.log(`[JobCleanerV2] No company match found for: "${cleanedName}"`);
        return null;
    } catch (error) {
        console.error(`[JobCleanerV2] Error matching company "${companyName}":`, error.message);
        return null;
    }
}

/**
 * Main service function to process raw jobs
 * Reads rawjobs one by one, cleans them, matches companies, and inserts into jobs table
 * prevents duplicates by checking if job_id already exists in jobs table
 */
async function processRawJobs() {
    console.log('[JobCleanerV2] Starting job cleaning service (OpenRouter)...');

    if (!OPENROUTER_API_KEY) {
        console.error('[JobCleanerV2] OPENROUTER_API_KEY is not set in environment variables!');
        return;
    }

    console.log(`[JobCleanerV2] Using model: ${OPENROUTER_MODEL}`);

    try {
        // 1. Fetch all raw jobs
        const allRawJobs = await db.select().from(rawjobs);
        if (allRawJobs.length === 0) {
            console.log('[JobCleanerV2] No raw jobs found to process.');
            return;
        }

        // 2. Fetch already processed job IDs to prevent duplicates
        const processedJobs = await db.select({ id: jobs.id }).from(jobs);
        const processedIds = new Set(processedJobs.map(j => j.id));

        // 3. Filter for unprocessed jobs
        const toProcess = allRawJobs.filter(job => !processedIds.has(job.job_id));

        console.log(`[JobCleanerV2] Found ${toProcess.length} new jobs to process.`);

        let successCount = 0;
        let failCount = 0;

        // 4. Process one by one
        for (const rawJob of toProcess) {
            console.log(`[JobCleanerV2] Processing job ${rawJob.job_id}...`);

            try {
                const cleanedData = await cleanAndNormalizeJob(rawJob);

                if (cleanedData) {
                    // 5. Match company by name
                    const companyNameToMatch = cleanedData.company || rawJob.company;
                    const matchedCompany = await matchCompanyByName(companyNameToMatch);

                    // 6. Use company data if matched, otherwise null
                    const companyLogo = matchedCompany?.logo || null;
                    const companyLocation = matchedCompany?.location || null;
                    const companyWebsite = matchedCompany?.website || null;

                    await db.insert(jobs).values({
                        id: rawJob.job_id, // Map rawjobs.job_id -> jobs.id
                        title: cleanedData.title || rawJob.title,
                        company: cleanedData.company || rawJob.company,
                        logo: companyLogo,
                        location: companyLocation,
                        date_posted: cleanedData.date_posted,
                        deadline: cleanedData.deadline,
                        company_email: cleanedData.company_email,
                        description: cleanedData.description,
                        level: cleanedData.level,
                        website: companyWebsite
                    });
                    successCount++;
                    console.log(`[JobCleanerV2] Successfully saved job ${rawJob.job_id} (Company match: ${matchedCompany ? 'Yes' : 'No'})`);
                } else {
                    failCount++;
                }

                // Rate limit protection (1 second delay for OpenRouter)
                await delay(1000);

            } catch (err) {
                console.error(`[JobCleanerV2] Failed to process/save job ${rawJob.job_id}:`, err);
                failCount++;
            }
        }

        console.log(`[JobCleanerV2] Completed. Success: ${successCount}, Failed: ${failCount}`);

    } catch (err) {
        console.error('[JobCleanerV2] Critical error execution:', err);
    }
}

// Allow manual run for testing
if (require.main === module) {
    (async () => {
        await processRawJobs();
        process.exit(0);
    })();
}

module.exports = { processRawJobs };
