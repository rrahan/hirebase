const { db, schema } = require('../config/db');
const { jobs } = schema;
const { sql, desc, count, eq } = require('drizzle-orm');

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
 * Get job statistics including count of jobs added today
 * @route GET /api/v1/jobs/stats
 */
const getJobStats = async (req, res) => {
    try {
        // Get current date in IST
        const now = new Date();
        const istDate = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(now);

        // Count jobs added today (where date_posted = today's date)
        const todayResult = await db.select({ count: count() })
            .from(jobs)
            .where(eq(jobs.date_posted, istDate));

        const jobsAddedToday = todayResult[0]?.count || 0;

        res.status(200).json({
            success: true,
            data: {
                jobsAddedToday,
                date: istDate
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

