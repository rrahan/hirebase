const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const axios = require('axios');
const { nanoid } = require('nanoid');
const { db } = require('../config/db');
const { rawjobs } = require('../schema/rawjobs');
const { jobs } = require('../schema/jobs');
const { companies } = require('../schema/companies');
const { eq, ilike, inArray, sql } = require('drizzle-orm');
const { cleanCompanyName } = require('../utils/companyCleaner');
const Groq = require('groq-sdk');
const { SYSTEM_PROMPT } = require('../config/jobCleanerPrompt');

// ============================================================================
// CONFIGURATION
// ============================================================================
const CONFIG = {
    DELAY_MS: 100,            // Fast polite delay between jobs
    MAX_JOBS_PER_RUN: 500,     // Batch limit per run
    LOCK_FILE: path.resolve(__dirname, '../.job-cleaner.lock'),
};

// ============================================================================
// LOCK FILE MANAGEMENT
// ============================================================================
function acquireLock() {
    try {
        if (fs.existsSync(CONFIG.LOCK_FILE)) {
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
        console.log('[JobCleaner] Lock acquired successfully.');
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
// UTILITY & PARSING FUNCTIONS
// ============================================================================

function getCurrentISTDate() {
    const now = new Date();
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(now);
}

function parseDateStringToISO(dateStr) {
    if (!dateStr) return null;
    const str = String(dateStr).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    if (/^\d{2}-\d{2}-\d{4}$/.test(str)) {
        const [d, m, y] = str.split('-');
        return `${y}-${m}-${d}`;
    }
    if (/^\d{1,2}\s+\w+\s+\d{2,4}$/.test(str)) {
        const parts = str.split(/\s+/);
        const d = parts[0].padStart(2, '0');
        const mStr = parts[1];
        let y = parts[2];
        if (y && y.length === 2) y = `20${y}`;
        const months = { jan:'01', feb:'02', mar:'03', apr:'04', may:'05', jun:'06', jul:'07', aug:'08', sep:'09', oct:'10', nov:'11', dec:'12' };
        const m = months[mStr.toLowerCase().substring(0, 3)] || '01';
        return `${y}-${m}-${d}`;
    }
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
        const [d, m, y] = str.split('/');
        return `${y}-${m}-${d}`;
    }
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
    }
    return null;
}

function generateSEOSlug(title, company, location) {
    const slugify = (str) => {
        if (!str) return '';
        return str
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    };

    const truncate = (str, maxLen) => {
        if (!str || str.length <= maxLen) return str;
        const truncated = str.substring(0, maxLen);
        const lastHyphen = truncated.lastIndexOf('-');
        return lastHyphen > 0 ? truncated.substring(0, lastHyphen) : truncated;
    };

    const roleSlug = truncate(slugify(title), 30);
    const companySlug = truncate(slugify(company), 20);
    const city = location ? location.split(',')[0].trim() : '';
    const locationSlug = truncate(slugify(city), 15);
    const shortId = nanoid(8);

    const parts = [roleSlug, companySlug, locationSlug].filter(Boolean);
    parts.push(shortId);

    return parts.join('-');
}

function generateContentHash(title, company) {
    const normalized = `${(title || '').toLowerCase().trim()}|${(company || '').toLowerCase().trim()}`;
    return crypto.createHash('md5').update(normalized).digest('hex');
}

function normalizeForMatching(name) {
    if (!name) return '';
    return name
        .replace(/\s+dot\s+com\b/gi, '.com')
        .replace(/\s+dot\s+/gi, '.')
        .replace(/\s+dot$/gi, '.')
        .replace(/^dot\s+/gi, '.')
        .replace(/[-\s]+/g, '')
        .toLowerCase()
        .trim();
}

async function matchCompanyByName(companyName) {
    if (!companyName) return null;

    try {
        let cleanedName = cleanCompanyName(companyName);
        cleanedName = normalizeForMatching(cleanedName);

        // 1. Exact match
        let matchedCompanies = await db
            .select()
            .from(companies)
            .where(sql`LOWER(${companies.name}) = LOWER(${cleanedName})`);

        if (matchedCompanies.length > 0) {
            return matchedCompanies[0];
        }

        // 2. Contains match
        matchedCompanies = await db
            .select()
            .from(companies)
            .where(ilike(companies.name, `%${cleanedName}%`));

        if (matchedCompanies.length > 0) {
            return matchedCompanies[0];
        }

        // 3. Substring match
        const allCompanies = await db.select().from(companies);

        for (const company of allCompanies) {
            const normalizedDbName = normalizeForMatching(cleanCompanyName(company.name));
            if (normalizedDbName.length < 4) continue;

            if (cleanedName === normalizedDbName || cleanedName.startsWith(normalizedDbName)) {
                return company;
            }

            if (cleanedName.includes(normalizedDbName) &&
                normalizedDbName.length / cleanedName.length >= 0.6) {
                return company;
            }
        }

        // 4. First word match
        const firstWord = cleanedName.split(/\s+/)[0];
        if (firstWord && firstWord.length > 3) {
            matchedCompanies = await db
                .select()
                .from(companies)
                .where(ilike(companies.name, `${firstWord}%`));

            if (matchedCompanies.length > 0) {
                return matchedCompanies[0];
            }
        }

        return null;
    } catch (error) {
        console.error(`[JobCleaner] Error matching company "${companyName}":`, error.message);
        return null;
    }
}

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

    if (deadline && deadline < currentDate) {
        return false;
    }

    if (datePosted && datePosted < thirtyOneDaysAgo) {
        return false;
    }

    if (!datePosted) {
        return false;
    }

    return true;
}

// ============================================================================
// HEURISTIC & AI CLEANERS
// ============================================================================

function heuristicCleanJob(rawJob) {
    const title = rawJob.title ? rawJob.title.trim() : 'Unknown Position';
    const company = cleanCompanyName(rawJob.company || 'Unknown Company');

    const lowerTitle = title.toLowerCase();
    let level = 'Mid-Level';
    if (/lead|senior|sr\.|principal|architect|manager|head/i.test(lowerTitle)) {
        level = 'Senior';
    } else if (/junior|jr\.|intern|fresher|trainee|associate/i.test(lowerTitle)) {
        level = 'Junior';
    } else if (/executive|director|vp|cfo|cto|ceo/i.test(lowerTitle)) {
        level = 'Executive';
    }

    let email = null;
    const emailMatch = (rawJob.job_description || '').match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
        email = emailMatch[0];
    }

    const datePosted = parseDateStringToISO(rawJob.date_posted) || getCurrentISTDate();
    const deadline = parseDateStringToISO(rawJob.deadline);

    const descriptionArr = [
        {
            overview: rawJob.job_description || title,
            responsibilities: [],
            requirements: [],
            benefits: []
        }
    ];

    return {
        title,
        company,
        date_posted: datePosted,
        deadline: deadline || null,
        company_email: email,
        description: JSON.stringify(descriptionArr),
        level,
        isHeuristic: true
    };
}

async function cleanAndNormalizeJob(rawJob) {
    const prompt = SYSTEM_PROMPT.replace('{{RAW_DATA}}', JSON.stringify(rawJob, null, 2));

    // 1. Try Groq API (Optimal model: llama-3.1-8b-instant for fast 14.4K RPD / 500K TPD JSON extraction)
    const groqKey = process.env.GROQ_API_KEY;
    const groqModel = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
    if (groqKey) {
        try {
            const groq = new Groq({ apiKey: groqKey });
            const completion = await groq.chat.completions.create({
                messages: [{ role: 'system', content: prompt }],
                model: groqModel,
                temperature: 0.1,
                response_format: { type: 'json_object' }
            });

            const content = completion.choices[0]?.message?.content;
            if (content) {
                const parsed = JSON.parse(content);
                if (parsed && typeof parsed.description !== 'string') {
                    parsed.description = JSON.stringify(parsed.description);
                }
                parsed.date_posted = parseDateStringToISO(parsed.date_posted) || parseDateStringToISO(rawJob.date_posted) || getCurrentISTDate();
                parsed.deadline = parseDateStringToISO(parsed.deadline) || parseDateStringToISO(rawJob.deadline);
                return { ...parsed, isHeuristic: false, provider: 'groq' };
            }
        } catch (err) {
            // Silently proceed to OpenRouter fallback if Groq API fails or is restricted
        }
    }

    // 2. Try OpenRouter API
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    const openRouterModel = process.env.OPENROUTER_MODEL || 'inclusionai/ling-3.0-flash:free';
    if (openRouterKey) {
        try {
            const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
                model: openRouterModel,
                messages: [{ role: 'system', content: prompt }],
                temperature: 0.1,
                response_format: { type: 'json_object' }
            }, {
                headers: {
                    'Authorization': `Bearer ${openRouterKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://hirebase.xyz',
                    'X-Title': 'hirebase'
                },
                timeout: 2500
            });

            const content = response.data.choices?.[0]?.message?.content;
            if (content) {
                const parsed = JSON.parse(content);
                if (parsed && typeof parsed.description !== 'string') {
                    parsed.description = JSON.stringify(parsed.description);
                }
                parsed.date_posted = parseDateStringToISO(parsed.date_posted) || parseDateStringToISO(rawJob.date_posted) || getCurrentISTDate();
                parsed.deadline = parseDateStringToISO(parsed.deadline) || parseDateStringToISO(rawJob.deadline);
                return { ...parsed, isHeuristic: false, provider: 'openrouter' };
            }
        } catch (err) {
            // Silently proceed to heuristic fallback
        }
    }

    // 3. Heuristic Fallback
    return heuristicCleanJob(rawJob);
}

// ============================================================================
// MAIN PROCESS
// ============================================================================

async function processRawJobs() {
    console.log('[JobCleaner] Starting hybrid job cleaning service...');

    if (!acquireLock()) {
        return;
    }

    try {
        const rawJobBatch = await db.select().from(rawjobs).limit(CONFIG.MAX_JOBS_PER_RUN);
        if (rawJobBatch.length === 0) {
            console.log('[JobCleaner] No raw jobs found to process.');
            releaseLock();
            return;
        }

        const processedJobs = await db.select({ id: jobs.id, hash: jobs.content_hash }).from(jobs);
        const processedIds = new Set(processedJobs.map(j => j.id));
        const processedHashes = new Set(processedJobs.filter(j => j.hash).map(j => j.hash));

        const alreadyProcessedInBatch = rawJobBatch.filter(job => processedIds.has(job.job_id));
        if (alreadyProcessedInBatch.length > 0) {
            const idsToPurge = alreadyProcessedInBatch.map(j => j.job_id);
            console.log(`[JobCleaner] Purging ${idsToPurge.length} already-processed raw jobs from rawjobs...`);
            await db.delete(rawjobs).where(inArray(rawjobs.job_id, idsToPurge));
        }

        const jobsToProcess = rawJobBatch.filter(job => !processedIds.has(job.job_id));

        console.log(`[JobCleaner] Found ${jobsToProcess.length} new jobs to process in this batch (Batch size: ${CONFIG.MAX_JOBS_PER_RUN}).`);

        if (jobsToProcess.length === 0) {
            console.log('[JobCleaner] All jobs in current batch processed/purged.');
            releaseLock();
            return;
        }

        let successCount = 0;
        let failCount = 0;
        let duplicateCount = 0;
        let cleanedFromRawCount = 0;

        console.log(`[JobCleaner] Processing ${jobsToProcess.length} jobs in this batch...`);

        for (let i = 0; i < jobsToProcess.length; i++) {
            const rawJob = jobsToProcess[i];

            try {
                const cleanedData = await cleanAndNormalizeJob(rawJob);

                if (cleanedData) {
                    const companyNameToMatch = cleanedData.company || rawJob.company;
                    const matchedCompany = await matchCompanyByName(companyNameToMatch);

                    const companyLogo = matchedCompany?.logo || null;
                    const companyLocation = matchedCompany?.location || null;
                    const companyWebsite = matchedCompany?.website || null;

                    const jobTitle = cleanedData.title || rawJob.title || 'Job Listing';
                    const jobCompany = cleanedData.company || rawJob.company || 'Company';
                    const jobSlug = generateSEOSlug(jobTitle, jobCompany, companyLocation);

                    let descriptionToSave = cleanedData.description;
                    if (descriptionToSave && typeof descriptionToSave !== 'string') {
                        descriptionToSave = JSON.stringify(descriptionToSave);
                    }

                    const isActive = calculateIsActive(cleanedData.deadline, cleanedData.date_posted);
                    const contentHash = generateContentHash(jobTitle, jobCompany);

                    if (processedHashes.has(contentHash)) {
                        duplicateCount++;
                        await db.delete(rawjobs).where(eq(rawjobs.job_id, rawJob.job_id));
                        cleanedFromRawCount++;
                        continue;
                    }

                    await db.insert(jobs).values({
                        id: rawJob.job_id,
                        title: jobTitle,
                        company: jobCompany,
                        logo: companyLogo,
                        location: companyLocation,
                        date_posted: cleanedData.date_posted,
                        deadline: cleanedData.deadline,
                        company_email: cleanedData.company_email,
                        description: descriptionToSave,
                        level: cleanedData.level || 'Mid-Level',
                        website: companyWebsite,
                        slug: jobSlug,
                        is_active: isActive,
                        content_hash: contentHash
                    }).onConflictDoNothing({ target: jobs.id });

                    processedHashes.add(contentHash);
                    successCount++;

                    await db.delete(rawjobs).where(eq(rawjobs.job_id, rawJob.job_id));
                    cleanedFromRawCount++;
                } else {
                    failCount++;
                }

                if (i % 50 === 0 || i === jobsToProcess.length - 1) {
                    console.log(`[JobCleaner] Progress: ${i + 1}/${jobsToProcess.length} processed (Saved: ${successCount}, Dupes: ${duplicateCount})`);
                }

                await new Promise(res => setTimeout(res, CONFIG.DELAY_MS));

            } catch (err) {
                console.error(`[JobCleaner] Error processing job ${rawJob.job_id}:`, err.message);
                failCount++;
            }
        }

        const remainingRawJobs = await db.select({ count: sql`count(*)::int` }).from(rawjobs);
        const actualRemaining = remainingRawJobs[0]?.count || 0;

        console.log(`[JobCleaner] ========================================`);
        console.log(`[JobCleaner] Run completed!`);
        console.log(`[JobCleaner]   ✓ Saved: ${successCount}`);
        console.log(`[JobCleaner]   ✗ Failed: ${failCount}`);
        console.log(`[JobCleaner]   ⏭ Duplicates skipped: ${duplicateCount}`);
        console.log(`[JobCleaner]   🧹 Cleaned from rawjobs: ${cleanedFromRawCount}`);
        console.log(`[JobCleaner]   → Remaining in rawjobs: ${actualRemaining}`);
        console.log(`[JobCleaner] ========================================`);

    } catch (err) {
        console.error('[JobCleaner] Critical error during execution:', err);
    } finally {
        releaseLock();
    }
}

if (require.main === module) {
    (async () => {
        await processRawJobs();
        process.exit(0);
    })();
}

module.exports = { processRawJobs };
