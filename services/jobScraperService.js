const { db } = require('../config/db');
const { rawjobs } = require('../schema/rawjobs');
const { eq } = require('drizzle-orm');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { scrapeTechnoPark } = require('./scrapeTechnoPark');
const { scrapeSmartCity } = require('./scrapeSmartCity');
const { scrapeCyberPark } = require('./scrapeCyberPark');
const { scrapeULCyberPark } = require('./scrapeULCyberPark');
const { scrapeInfoPark } = require('./scrapeInfoPark');

/**
 * Helper function to process and save scraped jobs
 * Checks for duplicates using job_id before inserting
 */
async function processAndSaveJobs(scraperName, scrapeFunction) {
    console.log(`[Scraper] Starting ${scraperName}...`);
    try {
        const jobs = await scrapeFunction();
        if (!jobs || jobs.length === 0) {
            console.log(`[Scraper] ${scraperName} found no jobs.`);
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
                console.error(`[Scraper] Error saving job ${job.job_id} from ${scraperName}:`, err.message);
                errorCount++;
            }
        }
        console.log(`[Scraper] ${scraperName} finished. New: ${newCount}, Dupes: ${skipCount}, Errors: ${errorCount}, Total Scraped: ${jobs.length}`);

    } catch (err) {
        console.error(`[Scraper] Critical error running ${scraperName}:`, err);
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
    console.log(`[Scraper] Starting all scrapers execution at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);

    // Run sequentially to verify connection handling and not overwhelm DB/Network
    await runTechnoPark();
    await runSmartCity();
    await runCyberPark();
    await runULCyberPark();
    await runInfoPark();

    console.log('[Scraper] All scrapers execution completed.');
    console.log('================================================');
}

// Allow running directly for testing: node services/jobScraperService.js
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

module.exports = {
    runAllScrapers,
    runTechnoPark,
    runSmartCity,
    runCyberPark,
    runULCyberPark,
    runInfoPark
};
