
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const Groq = require('groq-sdk');
const { db } = require('../config/db');
const { rawjobs } = require('../schema/rawjobs');
const { jobs } = require('../schema/jobs');
const { SYSTEM_PROMPT } = require('../config/jobCleanerPrompt');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Helper to delay for rate limits
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Normalizes a single job using Groq AI
 * @param {Object} rawJob 
 * @returns {Promise<Object|null>}
 */
async function cleanAndNormalizeJob(rawJob) {
    try {
        const prompt = SYSTEM_PROMPT.replace('{{RAW_DATA}}', JSON.stringify(rawJob, null, 2));

        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: prompt }
            ],
            model: 'llama3-70b-8192',
            temperature: 0.1,
            response_format: { type: 'json_object' }
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) throw new Error('No content from Groq');

        return JSON.parse(content);
    } catch (error) {
        console.error(`[JobCleaner] Error normalizing job ${rawJob.job_id}:`, error.message);
        return null;
    }
}

/**
 * Main service function to process raw jobs
 * Reads rawjobs one by one, cleans them, and inserts into jobs table
 * prevents duplicates by checking if job_id already exists in jobs table
 */
async function processRawJobs() {
    console.log('[JobCleaner] Starting job cleaning service...');

    try {
        // 1. Fetch all raw jobs
        const allRawJobs = await db.select().from(rawjobs);
        if (allRawJobs.length === 0) {
            console.log('[JobCleaner] No raw jobs found to process.');
            return;
        }

        // 2. Fetch already processed job IDs to prevent duplicates
        const processedJobs = await db.select({ id: jobs.id }).from(jobs);
        const processedIds = new Set(processedJobs.map(j => j.id));

        // 3. Filter for unprocessed jobs
        const toProcess = allRawJobs.filter(job => !processedIds.has(job.job_id));

        console.log(`[JobCleaner] Found ${toProcess.length} new jobs to process.`);

        let successCount = 0;
        let failCount = 0;

        // 4. Process one by one
        for (const rawJob of toProcess) {
            console.log(`[JobCleaner] Processing job ${rawJob.job_id}...`);

            try {
                const cleanedData = await cleanAndNormalizeJob(rawJob);

                if (cleanedData) {
                    // Check if properties exist, provide fallbacks if necessary, though AI should handle it
                    await db.insert(jobs).values({
                        id: rawJob.job_id, // Map rawjobs.job_id -> jobs.id
                        title: cleanedData.title || rawJob.title,
                        company: cleanedData.company || rawJob.company,
                        logo: cleanedData.logo,
                        location: cleanedData.location,
                        date_posted: cleanedData.date_posted,
                        deadline: cleanedData.deadline,
                        company_email: cleanedData.company_email,
                        description: cleanedData.description,
                        level: cleanedData.level
                    });
                    successCount++;
                    console.log(`[JobCleaner] successfully saved job ${rawJob.job_id}`);
                } else {
                    failCount++;
                }

                // Rate limit protection (2 seconds delay)
                await delay(2000);

            } catch (err) {
                console.error(`[JobCleaner] Failed to process/save job ${rawJob.job_id}:`, err);
                failCount++;
            }
        }

        console.log(`[JobCleaner] Completed. Success: ${successCount}, Failed: ${failCount}`);

    } catch (err) {
        console.error('[JobCleaner] Critical error execution:', err);
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
