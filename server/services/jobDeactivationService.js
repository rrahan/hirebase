const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { db } = require('../config/db');
const { jobs } = require('../schema/jobs');
const { eq } = require('drizzle-orm');

/**
 * Gets the current date in IST (Indian Standard Time) as YYYY-MM-DD string
 * @returns {string} Current date in YYYY-MM-DD format
 */
function getCurrentISTDate() {
    const now = new Date();
    // Format to IST using Intl.DateTimeFormat
    const istDate = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(now);

    return istDate; // Returns YYYY-MM-DD
}

/**
 * Gets a date 31 days ago in IST as YYYY-MM-DD string
 * @returns {string} Date 31 days ago in YYYY-MM-DD format
 */
function getDate31DaysAgoIST() {
    const now = new Date();
    now.setDate(now.getDate() - 31);

    const istDate = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(now);

    return istDate; // Returns YYYY-MM-DD
}

/**
 * Deactivates jobs that meet any of these criteria:
 * 1. Deadline has passed the current IST date
 * 2. date_posted is more than 31 days old
 * 3. date_posted is null
 * Only processes jobs where is_active = true.
 */
async function deactivateExpiredJobs() {
    console.log('[JobDeactivation] Starting job deactivation check...');

    try {
        const currentDate = getCurrentISTDate();
        const cutoffDate = getDate31DaysAgoIST();
        console.log(`[JobDeactivation] Current IST date: ${currentDate}`);
        console.log(`[JobDeactivation] 31-day cutoff date: ${cutoffDate}`);

        // Fetch all active jobs
        const activeJobs = await db.select()
            .from(jobs)
            .where(eq(jobs.is_active, true));

        console.log(`[JobDeactivation] Found ${activeJobs.length} active jobs to check.`);

        let deactivatedByDeadline = 0;
        let deactivatedByAge = 0;
        let deactivatedByNullDate = 0;

        for (const job of activeJobs) {
            let shouldDeactivate = false;
            let reason = '';

            // Check 1: Deadline has passed
            if (job.deadline && job.deadline < currentDate) {
                shouldDeactivate = true;
                reason = `deadline passed (${job.deadline})`;
                deactivatedByDeadline++;
            }
            // Check 2: date_posted is more than 31 days old
            else if (job.date_posted && job.date_posted < cutoffDate) {
                shouldDeactivate = true;
                reason = `posted 31+ days ago (${job.date_posted})`;
                deactivatedByAge++;
            }
            // Check 3: date_posted is null
            else if (!job.date_posted) {
                shouldDeactivate = true;
                reason = 'date_posted is null';
                deactivatedByNullDate++;
            }

            if (shouldDeactivate) {
                await db.update(jobs)
                    .set({ is_active: false })
                    .where(eq(jobs.id, job.id));

                console.log(`[JobDeactivation] Deactivated job ${job.id} - ${reason}`);
            }
        }

        const totalDeactivated = deactivatedByDeadline + deactivatedByAge + deactivatedByNullDate;
        console.log(`[JobDeactivation] Completed. Deactivated ${totalDeactivated} jobs (${deactivatedByDeadline} by deadline, ${deactivatedByAge} by age, ${deactivatedByNullDate} by null date).`);

    } catch (error) {
        console.error('[JobDeactivation] Error during deactivation:', error);
    }
}

// Allow manual run for testing: node services/jobDeactivationService.js
if (require.main === module) {
    (async () => {
        await deactivateExpiredJobs();
        process.exit(0);
    })();
}

module.exports = { deactivateExpiredJobs };
