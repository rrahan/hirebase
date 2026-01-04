
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const Groq = require('groq-sdk');
const { nanoid } = require('nanoid');
const { db } = require('../config/db');
const { rawjobs } = require('../schema/rawjobs');
const { jobs } = require('../schema/jobs');
const { companies } = require('../schema/companies');
const { eq, ilike, sql } = require('drizzle-orm');
const { cleanCompanyName } = require('../utils/companyCleaner');
const { SYSTEM_PROMPT } = require('../config/jobCleanerPrompt');

// ============================================================================
// CONFIGURATION
// ============================================================================
const CONFIG = {
    MODEL: 'meta-llama/llama-4-scout-17b-16e-instruct',  // Optimal for structured extraction
    DELAY_MS: 5000,           // 5 seconds between jobs (stays under 30K tokens/min)
    MAX_JOBS_PER_RUN: 200,    // Batch limit to stay under 500K tokens/day
    LOCK_FILE: path.resolve(__dirname, '../.job-cleaner.lock'),
};

// ============================================================================
// LOCK FILE MANAGEMENT (Prevents overlapping cron runs)
// ============================================================================
function acquireLock() {
    try {
        if (fs.existsSync(CONFIG.LOCK_FILE)) {
            // Check if lock is stale (older than 2 hours)
            const stats = fs.statSync(CONFIG.LOCK_FILE);
            const lockAge = Date.now() - stats.mtimeMs;
            const twoHours = 2 * 60 * 60 * 1000;

            if (lockAge > twoHours) {
                console.log('[JobCleaner] Found stale lock file, removing...');
                fs.unlinkSync(CONFIG.LOCK_FILE);
            } else {
                console.log('[JobCleaner] Another instance is running (lock file exists). Exiting.');
                return false;
            }
        }

        // Create lock file with current timestamp
        fs.writeFileSync(CONFIG.LOCK_FILE, JSON.stringify({
            pid: process.pid,
            startedAt: new Date().toISOString()
        }));
        console.log('[JobCleaner] Lock acquired.');
        return true;
    } catch (error) {
        console.error('[JobCleaner] Error acquiring lock:', error.message);
        return false;
    }
}

function releaseLock() {
    try {
        if (fs.existsSync(CONFIG.LOCK_FILE)) {
            fs.unlinkSync(CONFIG.LOCK_FILE);
            console.log('[JobCleaner] Lock released.');
        }
    } catch (error) {
        console.error('[JobCleaner] Error releasing lock:', error.message);
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Gets the current date in IST as YYYY-MM-DD string
 * @returns {string} Current date in YYYY-MM-DD format
 */
function getCurrentISTDate() {
    const now = new Date();
    const istDate = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(now);
    return istDate;
}

/**
 * Generates an SEO-friendly slug for a job posting
 * Format: [role]-[company]-[location]-[id]
 * @param {string} title - Job title/role
 * @param {string} company - Company name
 * @param {string} location - Job location
 * @returns {string} SEO-friendly slug
 */
function generateSEOSlug(title, company, location) {
    // Helper to slugify a string
    const slugify = (str) => {
        if (!str) return '';
        return str
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-')      // Replace spaces with hyphens
            .replace(/-+/g, '-')       // Replace multiple hyphens with single
            .replace(/^-|-$/g, '');    // Remove leading/trailing hyphens
    };

    // Helper to truncate and keep SEO-friendly
    const truncate = (str, maxLen) => {
        if (!str || str.length <= maxLen) return str;
        // Cut at word boundary
        const truncated = str.substring(0, maxLen);
        const lastHyphen = truncated.lastIndexOf('-');
        return lastHyphen > 0 ? truncated.substring(0, lastHyphen) : truncated;
    };

    const roleSlug = truncate(slugify(title), 30);
    const companySlug = truncate(slugify(company), 20);

    // Extract city from location (first part before comma)
    const city = location ? location.split(',')[0].trim() : '';
    const locationSlug = truncate(slugify(city), 15);

    // Generate short unique ID (8 characters)
    const shortId = nanoid(8);

    // Build slug parts (only include non-empty parts)
    const parts = [roleSlug, companySlug, locationSlug].filter(Boolean);

    // Always append the unique ID at the end
    parts.push(shortId);

    return parts.join('-');
}

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Helper to delay for rate limits
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Normalizes a single job using Groq AI
 * Returns { data, rateLimited } to handle rate limits gracefully
 * @param {Object} rawJob 
 * @returns {Promise<{data: Object|null, rateLimited: boolean}>}
 */
async function cleanAndNormalizeJob(rawJob) {
    try {
        const prompt = SYSTEM_PROMPT.replace('{{RAW_DATA}}', JSON.stringify(rawJob, null, 2));

        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: prompt }
            ],
            model: CONFIG.MODEL,
            temperature: 0.1,
            response_format: { type: 'json_object' }
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) throw new Error('No content from Groq');

        return { data: JSON.parse(content), rateLimited: false };
    } catch (error) {
        // Check for rate limit errors (429)
        if (error.status === 429 || error.message?.includes('rate limit') || error.message?.includes('429')) {
            console.warn(`[JobCleaner] Rate limit hit! Stopping gracefully.`);
            return { data: null, rateLimited: true };
        }

        console.error(`[JobCleaner] Error normalizing job ${rawJob.job_id}:`, error.message);
        return { data: null, rateLimited: false };
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
        .replace(/\s+dot\s+com\b/gi, '.com')  // "Way Dot Com" -> "Way.com"
        .replace(/\s+dot\s+/gi, '.')      // "Way Dot Something" -> "Way.Something"
        .replace(/\s+dot$/gi, '.')         // trailing "dot"
        .replace(/^dot\s+/gi, '.')         // leading "dot"
        .replace(/[-\s]+/g, '')            // remove all spaces AND hyphens for matching
        .toLowerCase()                      // case insensitive
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
            console.log(`[JobCleaner] Exact match: ${matchedCompanies[0].name} for "${cleanedName}"`);
            return matchedCompanies[0];
        }

        // 2. Try contains match (DB company name contains our search)
        matchedCompanies = await db
            .select()
            .from(companies)
            .where(ilike(companies.name, `%${cleanedName}%`));

        if (matchedCompanies.length > 0) {
            console.log(`[JobCleaner] Contains match: ${matchedCompanies[0].name} for "${cleanedName}"`);
            return matchedCompanies[0];
        }

        // 3. Try reverse contains (our search contains DB company name)
        // This handles "Feathersoft Info Solutions" matching "Feathersoft"
        const allCompanies = await db.select().from(companies);

        for (const company of allCompanies) {
            // Normalize DB company name the same way for comparison
            const normalizedDbName = normalizeForMatching(cleanCompanyName(company.name));
            if (cleanedName.includes(normalizedDbName) || normalizedDbName.includes(cleanedName)) {
                console.log(`[JobCleaner] Reverse contains match: ${company.name} for "${cleanedName}"`);
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
                console.log(`[JobCleaner] First-word match: ${matchedCompanies[0].name} for "${firstWord}"`);
                return matchedCompanies[0];
            }
        }

        console.log(`[JobCleaner] No company match found for: "${cleanedName}"`);
        return null;
    } catch (error) {
        console.error(`[JobCleaner] Error matching company "${companyName}":`, error.message);
        return null;
    }
}

/**
 * Determines if a job should be active based on deadline and date_posted
 * @param {string|null} deadline - Job deadline in YYYY-MM-DD format
 * @param {string|null} datePosted - Date posted in YYYY-MM-DD format
 * @returns {boolean} - Whether the job should be marked as active
 */
function calculateIsActive(deadline, datePosted) {
    const currentDate = getCurrentISTDate();
    const thirtyOneDaysAgo = (() => {
        const date = new Date();
        date.setDate(date.getDate() - 31);
        return new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(date);
    })();

    // Check 1: Deadline has passed
    if (deadline && deadline < currentDate) {
        console.log(`[JobCleaner] Job deadline passed (${deadline}), setting is_active=false`);
        return false;
    }

    // Check 2: date_posted is more than 31 days old
    if (datePosted && datePosted < thirtyOneDaysAgo) {
        console.log(`[JobCleaner] Job too old (${datePosted}), setting is_active=false`);
        return false;
    }

    // Check 3: date_posted is null (treat as potentially stale)
    if (!datePosted) {
        console.log(`[JobCleaner] No date_posted, setting is_active=false`);
        return false;
    }

    return true;
}

/**
 * Main service function to process raw jobs
 * Reads rawjobs one by one, cleans them, matches companies, and inserts into jobs table
 * - Prevents duplicates by checking if job_id already exists in jobs table
 * - Limits to MAX_JOBS_PER_RUN to stay under daily token limits
 * - Handles rate limits gracefully
 * - Uses lock file to prevent overlapping runs
 */
async function processRawJobs() {
    console.log('[JobCleaner] Starting job cleaning service...');
    console.log(`[JobCleaner] Config: Model=${CONFIG.MODEL}, Delay=${CONFIG.DELAY_MS}ms, MaxJobs=${CONFIG.MAX_JOBS_PER_RUN}`);

    // Try to acquire lock
    if (!acquireLock()) {
        return;
    }

    try {
        // 1. Fetch all raw jobs
        const allRawJobs = await db.select().from(rawjobs);
        if (allRawJobs.length === 0) {
            console.log('[JobCleaner] No raw jobs found to process.');
            releaseLock();
            return;
        }

        // 2. Fetch already processed job IDs to prevent duplicates
        const processedJobs = await db.select({ id: jobs.id }).from(jobs);
        const processedIds = new Set(processedJobs.map(j => j.id));

        // 3. Filter for unprocessed jobs
        const toProcess = allRawJobs.filter(job => !processedIds.has(job.job_id));

        console.log(`[JobCleaner] Found ${toProcess.length} new jobs to process (limit: ${CONFIG.MAX_JOBS_PER_RUN}).`);

        if (toProcess.length === 0) {
            console.log('[JobCleaner] No new jobs to process.');
            releaseLock();
            return;
        }

        let successCount = 0;
        let failCount = 0;
        let skippedCount = 0;
        let rateLimited = false;

        // 4. Process one by one, up to MAX_JOBS_PER_RUN
        const jobsToProcess = toProcess.slice(0, CONFIG.MAX_JOBS_PER_RUN);
        console.log(`[JobCleaner] Processing ${jobsToProcess.length} jobs this run...`);

        for (let i = 0; i < jobsToProcess.length; i++) {
            const rawJob = jobsToProcess[i];
            console.log(`[JobCleaner] Processing job ${i + 1}/${jobsToProcess.length}: ${rawJob.job_id}...`);

            try {
                const result = await cleanAndNormalizeJob(rawJob);

                // Check for rate limit
                if (result.rateLimited) {
                    rateLimited = true;
                    skippedCount = jobsToProcess.length - i;
                    console.log(`[JobCleaner] Rate limited! Stopping. ${skippedCount} jobs will be processed next run.`);
                    break;
                }

                if (result.data) {
                    const cleanedData = result.data;

                    // 5. Match company by name
                    const companyNameToMatch = cleanedData.company || rawJob.company;
                    const matchedCompany = await matchCompanyByName(companyNameToMatch);

                    // 6. Use company data if matched, otherwise null
                    const companyLogo = matchedCompany?.logo || null;
                    const companyLocation = matchedCompany?.location || null;
                    const companyWebsite = matchedCompany?.website || null;

                    // Generate SEO-friendly slug
                    const jobTitle = cleanedData.title || rawJob.title;
                    const jobCompany = cleanedData.company || rawJob.company;
                    const jobSlug = generateSEOSlug(jobTitle, jobCompany, companyLocation);

                    // Handle description - ensure proper JSON stringification
                    let descriptionToSave = cleanedData.description;
                    if (descriptionToSave && typeof descriptionToSave !== 'string') {
                        // If it's an object/array, stringify it once
                        descriptionToSave = JSON.stringify(descriptionToSave);
                    }

                    // Calculate is_active based on deadline and date_posted
                    const isActive = calculateIsActive(cleanedData.deadline, cleanedData.date_posted);

                    await db.insert(jobs).values({
                        id: rawJob.job_id, // Map rawjobs.job_id -> jobs.id
                        title: jobTitle,
                        company: jobCompany,
                        logo: companyLogo,
                        location: companyLocation,
                        date_posted: cleanedData.date_posted,
                        deadline: cleanedData.deadline,
                        company_email: cleanedData.company_email,
                        description: descriptionToSave,
                        level: cleanedData.level,
                        website: companyWebsite,
                        slug: jobSlug,
                        is_active: isActive
                    });
                    successCount++;
                    console.log(`[JobCleaner] ✓ Saved job ${rawJob.job_id} (Company: ${matchedCompany ? 'matched' : 'no match'}, Active: ${isActive})`);
                } else {
                    failCount++;
                }

                // Rate limit protection
                await delay(CONFIG.DELAY_MS);

            } catch (err) {
                console.error(`[JobCleaner] Failed to process/save job ${rawJob.job_id}:`, err);
                failCount++;
            }
        }

        // Summary
        const remaining = toProcess.length - successCount - failCount;
        console.log(`[JobCleaner] ========================================`);
        console.log(`[JobCleaner] Run completed!`);
        console.log(`[JobCleaner]   ✓ Success: ${successCount}`);
        console.log(`[JobCleaner]   ✗ Failed: ${failCount}`);
        if (rateLimited) {
            console.log(`[JobCleaner]   ⏸ Skipped (rate limit): ${skippedCount}`);
        }
        console.log(`[JobCleaner]   → Remaining for next run: ${remaining > 0 ? remaining : 0}`);
        console.log(`[JobCleaner] ========================================`);

    } catch (err) {
        console.error('[JobCleaner] Critical error during execution:', err);
    } finally {
        // Always release lock
        releaseLock();
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
