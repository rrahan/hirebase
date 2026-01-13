const { db, schema } = require('../config/db');
const { jobs } = schema;
const { sql, desc, count, eq, gte, lt, and, ilike, or } = require('drizzle-orm');

/**
 * Get all jobs with pagination and filtering
 * @route GET /api/v1/jobs
 * @query page - Page number (default: 1)
 * @query limit - Jobs per page (default: 10)
 * @query level - Filter by experience level (comma-separated for multiple)
 * @query location - Filter by location (comma-separated for multiple)
 * @query company - Filter by company (comma-separated for multiple)
 * @query dateRange - Filter by recency: 1d, 7d, 30d
 */
const getJobs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Parse filter parameters
        const levelFilter = req.query.level ? req.query.level.split(',').filter(Boolean) : [];
        const locationFilter = req.query.location ? req.query.location.split(',').filter(Boolean) : [];
        const companyFilter = req.query.company ? req.query.company.split(',').filter(Boolean) : [];
        const dateRange = req.query.dateRange;
        const searchQuery = req.query.search ? req.query.search.trim() : '';

        // Build filter conditions
        const conditions = [eq(jobs.is_active, true)];

        // Search by job title only (partial match)
        if (searchQuery) {
            conditions.push(ilike(jobs.title, `%${searchQuery}%`));
        }

        // Level filter (exact match, multiple values = OR)
        if (levelFilter.length > 0) {
            const levelConditions = levelFilter.map(level => eq(jobs.level, level));
            conditions.push(or(...levelConditions));
        }

        // Location filter (partial match using ilike, multiple values = OR)
        if (locationFilter.length > 0) {
            const locationConditions = locationFilter.map(loc => ilike(jobs.location, `%${loc}%`));
            conditions.push(or(...locationConditions));
        }

        // Company filter (partial match using ilike, multiple values = OR)
        if (companyFilter.length > 0) {
            const companyConditions = companyFilter.map(comp => ilike(jobs.company, `%${comp}%`));
            conditions.push(or(...companyConditions));
        }

        // Date range filter (based on date_posted, not created_at)
        if (dateRange) {
            const now = new Date();
            let cutoffDate;
            switch (dateRange) {
                case '1d':
                    cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    break;
                case '7d':
                    cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case '30d':
                    cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
            }
            if (cutoffDate) {
                // date_posted is varchar, so cast to date for comparison
                // Filter: cutoffDate <= date_posted <= today (exclude future dates)
                const cutoffStr = cutoffDate.toISOString().split('T')[0]; // YYYY-MM-DD format
                const todayStr = now.toISOString().split('T')[0];
                conditions.push(sql`${jobs.date_posted}::date >= ${cutoffStr}::date`);
                conditions.push(sql`${jobs.date_posted}::date <= ${todayStr}::date`);
            }
        }

        const whereClause = and(...conditions);

        // Get total count with filters
        const totalResult = await db.select({ count: count() })
            .from(jobs)
            .where(whereClause);
        const totalJobs = totalResult[0]?.count || 0;
        const totalPages = Math.ceil(totalJobs / limit);

        // Get paginated jobs with filters
        const jobsList = await db
            .select()
            .from(jobs)
            .where(whereClause)
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
            },
            filters: {
                level: levelFilter,
                location: locationFilter,
                company: companyFilter,
                dateRange: dateRange || null,
                search: searchQuery || null
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
 * Get available filter options (unique values from database)
 * @route GET /api/v1/jobs/filters
 */
const getFilterOptions = async (req, res) => {
    try {
        // Get unique levels
        const levelsResult = await db
            .selectDistinct({ level: jobs.level })
            .from(jobs)
            .where(and(eq(jobs.is_active, true), sql`${jobs.level} IS NOT NULL AND ${jobs.level} != ''`))
            .orderBy(jobs.level);

        // Get unique locations with count
        const locationsResult = await db
            .select({
                location: jobs.location,
                count: count()
            })
            .from(jobs)
            .where(and(eq(jobs.is_active, true), sql`${jobs.location} IS NOT NULL AND ${jobs.location} != ''`))
            .groupBy(jobs.location)
            .orderBy(desc(count()))
            .limit(50);

        // Get unique companies with count (sorted alphabetically, no limit)
        // Use LOWER(TRIM()) to deduplicate companies with different casing/whitespace
        const companiesResult = await db
            .select({
                company: sql`MIN(TRIM(${jobs.company}))`.as('company'),
                count: count()
            })
            .from(jobs)
            .where(and(eq(jobs.is_active, true), sql`${jobs.company} IS NOT NULL AND TRIM(${jobs.company}) != ''`))
            .groupBy(sql`LOWER(TRIM(${jobs.company}))`)
            .orderBy(sql`LOWER(TRIM(${jobs.company}))`);

        const levelOrder = ['Internship', 'Junior', 'Mid-Level', 'Senior', 'Manager'];
        const levels = levelsResult
            .map(r => r.level)
            .filter(Boolean)
            .sort((a, b) => levelOrder.indexOf(a) - levelOrder.indexOf(b));

        res.status(200).json({
            success: true,
            data: {
                levels: levels,
                locations: locationsResult.map(r => ({ label: r.location, count: r.count })),
                companies: companiesResult.map(r => ({ label: r.company, count: r.count })),
                dateRanges: [
                    { value: '1d', label: 'Last 24 hours' },
                    { value: '7d', label: 'Last 7 days' },
                    { value: '30d', label: 'Last 30 days' }
                ]
            }
        });
    } catch (error) {
        console.error('Error fetching filter options:', error);
        res.status(500).json({
            success: false,
            error: 'Server Error',
            message: 'Failed to fetch filter options'
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

module.exports = { getJobs, getJobBySlug, getJobStats, getFilterOptions };

