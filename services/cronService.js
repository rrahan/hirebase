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


/**
 * Helper function to process and save scraped jobs
 * Checks for duplicates using job_id before inserting
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
        let errorCount = 0;

        for (const job of jobs) {
            try {
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
        console.log(`[Cron] ${scraperName} finished. New: ${newCount}, Dupes: ${skipCount}, Errors: ${errorCount}, Total Scraped: ${jobs.length}`);

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

    // Schedule for 11:30 PM IST (Indian Standard Time)
    // 30 23 * * *
    cron.schedule('30 23 * * *', () => {
        runAllScrapers();
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });

    console.log('[Cron] Daily scraper job scheduled for 11:30 PM IST.');

    // Schedule Job Cleaner for 11:55 PM IST
    // 55 23 * * *
    cron.schedule('55 23 * * *', () => {
        processRawJobs();
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });

    console.log('[Cron] Job Cleaner service scheduled for 11:55 PM IST.');
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
