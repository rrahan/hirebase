const { db, schema } = require('../config/db');
const { jobs } = schema;
const { sql, desc, count, eq, gte, lt } = require('drizzle-orm');

/**
 * Get all jobs with pagination
 * @route GET /api/v1/jobs
 * @query page - Page number (default: 1)
 * @query limit - Jobs per page (default: 10)
 */
const getJobs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Get total count of active jobs only
        const totalResult = await db.select({ count: count() })
            .from(jobs)
            .where(eq(jobs.is_active, true));
        const totalJobs = totalResult[0]?.count || 0;
        const totalPages = Math.ceil(totalJobs / limit);

        // Get paginated active jobs only
        const jobsList = await db
            .select()
            .from(jobs)
            .where(eq(jobs.is_active, true))
            .orderBy(desc(jobs.date_posted))
            .limit(limit)
            .offset(offset);

        // Parse description JSON for each job and remove is_active
        const parsedJobs = jobsList.map(job => {
            const { is_active, ...jobData } = job;
            return {
                ...jobData,
                description: job.description ? (() => {
                    try {
                        return JSON.parse(job.description);
                    } catch {
                        return job.description;
                    }
                })() : null
            };
        });

        res.status(200).json({
            success: true,
            data: parsedJobs,
            pagination: {
                currentPage: page,
                totalPages,
                totalJobs,
                jobsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({
            success: false,
            error: 'Server Error',
            message: 'Failed to fetch jobs'
        });
    }
};

/**
 * Get a single job by slug
 * @route GET /api/v1/jobs/:slug
 */
const getJobBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        if (!slug) {
            return res.status(400).json({
                success: false,
                error: 'Bad Request',
                message: 'Slug is required'
            });
        }

        // Find job by slug
        const jobResult = await db
            .select()
            .from(jobs)
            .where(eq(jobs.slug, slug))
            .limit(1);

        if (jobResult.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Not Found',
                message: 'Job not found'
            });
        }

        const job = jobResult[0];

        // Parse description JSON
        let parsedDescription = job.description;
        if (job.description) {
            try {
                parsedDescription = JSON.parse(job.description);
            } catch {
                // Keep as string if not valid JSON
            }
        }

        res.status(200).json({
            success: true,
            data: {
                ...job,
                description: parsedDescription
            }
        });
    } catch (error) {
        console.error('Error fetching job by slug:', error);
        res.status(500).json({
            success: false,
            error: 'Server Error',
            message: 'Failed to fetch job'
        });
    }
};

/**
 * Get job statistics including count of new jobs added
 * Uses 11pm IST as the cutoff time (when job cleaner runs)
 * - Before 11pm IST: shows jobs added since yesterday 11pm
 * - After 11pm IST: shows jobs added since today 11pm
 * @route GET /api/v1/jobs/stats
 */
const getJobStats = async (req, res) => {
    try {
        const now = new Date();

        // Get current time in IST
        const istTimeFormatter = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            hour12: false
        });
        const currentHourIST = parseInt(istTimeFormatter.format(now));

        // Get today's date in IST
        const istDateFormatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        const todayIST = istDateFormatter.format(now);

        // Calculate the cutoff timestamp (last 11pm IST)
        let cutoffDate;
        if (currentHourIST >= 23) {
            // After 11pm today - use today's 11pm as cutoff
            cutoffDate = new Date(todayIST + 'T23:00:00+05:30');
        } else {
            // Before 11pm today - use yesterday's 11pm as cutoff
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayIST = istDateFormatter.format(yesterday);
            cutoffDate = new Date(yesterdayIST + 'T23:00:00+05:30');
        }

        // Count jobs added since the last 11pm cutoff
        const result = await db.select({ count: count() })
            .from(jobs)
            .where(sql`${jobs.created_at} >= ${cutoffDate}`);

        const newJobsCount = result[0]?.count || 0;

        res.status(200).json({
            success: true,
            data: {
                newJobsCount,
                currentDate: todayIST
            }
        });
    } catch (error) {
        console.error('Error fetching job stats:', error);
        res.status(500).json({
            success: false,
            error: 'Server Error',
            message: 'Failed to fetch job statistics'
        });
    }
};

module.exports = { getJobs, getJobBySlug, getJobStats };

