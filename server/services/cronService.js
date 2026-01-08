const cron = require('node-cron');
const { db } = require('../config/db');
const { rawjobs } = require('../schema/rawjobs');
const { eq } = require('drizzle-orm');

const { scrapeTechnoPark } = require('./scrapeTechnoPark');
const { scrapeSmartCity } = require('./scrapeSmartCity');
const { scrapeCyberPark } = require('./scrapeCyberPark');
const { scrapeULCyberPark } = require('./scrapeULCyberPark');
const { scrapeInfoPark } = require('./scrapeInfoPark');
const { processRawJobs } = require('./jobCleanerService');
const { deactivateExpiredJobs } = require('./jobDeactivationService');

// Configuration: Skip jobs older than this many days
const MAX_JOB_AGE_DAYS = 60;

/**
 * Checks if a job's date_posted is too old (older than MAX_JOB_AGE_DAYS)
 * @param {string} datePosted - Date string in various formats (YYYY-MM-DD, DD-MM-YYYY, etc.)
 * @returns {boolean} - true if job is too old and should be skipped
 */
function isJobTooOld(datePosted) {
    if (!datePosted) return false; // If no date, let it through (will be handled by cleaner)

    const now = new Date();
    const cutoffDate = new Date();
    cutoffDate.setDate(now.getDate() - MAX_JOB_AGE_DAYS);

    let parsedDate;

    // Try parsing various date formats
    // Format: YYYY-MM-DD (ISO)
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePosted)) {
        parsedDate = new Date(datePosted);
    }
    // Format: DD-MM-YYYY
    else if (/^\d{2}-\d{2}-\d{4}$/.test(datePosted)) {
        const [day, month, year] = datePosted.split('-');
        parsedDate = new Date(`${year}-${month}-${day}`);
    }
    // Format: DD Mon YY (e.g., "27 Mar 25")
    else if (/^\d{1,2}\s+\w+\s+\d{2}$/.test(datePosted)) {
        const parts = datePosted.split(/\s+/);
        const day = parts[0];
        const month = parts[1];
        const year = `20${parts[2]}`; // Assume 20xx
        parsedDate = new Date(`${day} ${month} ${year}`);
    }
    // Format: DD/MM/YYYY
    else if (/^\d{2}\/\d{2}\/\d{4}$/.test(datePosted)) {
        const [day, month, year] = datePosted.split('/');
        parsedDate = new Date(`${year}-${month}-${day}`);
    }
    // Fallback: try native parsing
    else {
        parsedDate = new Date(datePosted);
    }

    // If parsing failed, let the job through
    if (isNaN(parsedDate.getTime())) {
        return false;
    }

    return parsedDate < cutoffDate;
}

/**
 * Helper function to process and save scraped jobs
 * Checks for duplicates using job_id before inserting
 * Filters out jobs older than MAX_JOB_AGE_DAYS
 */
async function processAndSaveJobs(scraperName, scrapeFunction) {
    console.log(`[Cron] Starting ${scraperName}...`);
    try {
        const jobs = await scrapeFunction();
        if (!jobs || jobs.length === 0) {
            console.log(`[Cron] ${scraperName} found no jobs.`);
            return;
        }

        let newCount = 0;
        let skipCount = 0;
        let oldSkipCount = 0;
        let errorCount = 0;

        for (const job of jobs) {
            try {
                // Skip jobs that are too old (older than MAX_JOB_AGE_DAYS)
                if (isJobTooOld(job.date_posted)) {
                    oldSkipCount++;
                    continue;
                }

                // Check if job_id already exists
                const existing = await db.select({ id: rawjobs.job_id })
                    .from(rawjobs)
                    .where(eq(rawjobs.job_id, job.job_id));

                if (existing.length === 0) {
                    await db.insert(rawjobs).values(job);
                    newCount++;
                } else {
                    skipCount++;
                }
            } catch (err) {
                console.error(`[Cron] Error saving job ${job.job_id} from ${scraperName}:`, err.message);
                errorCount++;
            }
        }
        console.log(`[Cron] ${scraperName} finished. New: ${newCount}, Dupes: ${skipCount}, Old: ${oldSkipCount}, Errors: ${errorCount}, Total Scraped: ${jobs.length}`);

    } catch (err) {
        console.error(`[Cron] Critical error running ${scraperName}:`, err);
    }
}

// --- Individual Scraper Wrappers ---

async function runTechnoPark() {
    await processAndSaveJobs('TechnoPark', scrapeTechnoPark);
}

async function runSmartCity() {
    await processAndSaveJobs('SmartCity', scrapeSmartCity);
}

async function runCyberPark() {
    await processAndSaveJobs('CyberPark', scrapeCyberPark);
}

async function runULCyberPark() {
    await processAndSaveJobs('ULCyberPark', scrapeULCyberPark);
}

async function runInfoPark() {
    await processAndSaveJobs('InfoPark', scrapeInfoPark);
}

// --- Main execution function ---

async function runAllScrapers() {
    console.log('================================================');
    console.log(`[Cron] Starting daily scrapers execution at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);

    // Run sequentially to verify connection handling and not overwhelm DB/Network
    await runTechnoPark();
    await runSmartCity();
    await runCyberPark();
    await runULCyberPark();
    await runInfoPark();

    console.log('[Cron] All scrapers execution completed.');
    console.log('================================================');
}

// --- Scheduler ---

function initCronJobs() {
    console.log('[Cron] Initializing cron jobs...');

    // =========================================================================
    // CRON SCHEDULE (all times in IST)
    // =========================================================================
    // 11:00 PM - Scrapers (~10-15 min)
    // 11:30 PM - Job Cleaner (~17 min for 200 jobs, finishes ~11:47 PM)
    // 12:00 AM - Job Deactivation (~2-3 min)
    // =========================================================================

    // 1. SCRAPERS - 11:00 PM IST
    // Scrapes all job sources and saves to rawjobs table
    cron.schedule('0 23 * * *', () => {
        runAllScrapers();
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });

    console.log('[Cron] Daily scraper job scheduled for 11:00 PM IST.');

    // 2. JOB CLEANER - 11:30 PM IST
    // Cleans raw jobs with AI, inserts into jobs table (max 200 per run)
    // Takes ~17 minutes (200 jobs × 5 sec delay)
    cron.schedule('30 23 * * *', () => {
        processRawJobs();
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });

    console.log('[Cron] Job Cleaner service scheduled for 11:30 PM IST.');

    // 3. JOB DEACTIVATION - 12:00 AM IST (midnight)
    // Deactivates expired jobs (deadline passed or >31 days old)
    // Runs after cleaner finishes to catch any newly inserted expired jobs
    cron.schedule('0 0 * * *', () => {
        deactivateExpiredJobs();
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });

    console.log('[Cron] Job Deactivation service scheduled for 12:00 AM IST.');
}

module.exports = {
    initCronJobs,
    runAllScrapers,
    runTechnoPark,
    runSmartCity,
    runCyberPark,
    runULCyberPark,
    runInfoPark
};

// Allow running directly for testing: node services/cronService.js
if (require.main === module) {
    (async () => {
        try {
            console.log('Running manual execution of all scrapers...');
            await runAllScrapers();
            process.exit(0);
        } catch (error) {
            console.error('Manual execution failed:', error);
            process.exit(1);
        }
    })();
}
