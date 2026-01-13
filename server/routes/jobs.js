const express = require('express');
const router = express.Router();
const { getJobs, getJobBySlug, getJobStats, getFilterOptions } = require('../controllers/jobsController');

// GET /api/v1/jobs - Get all jobs with pagination
router.get('/', getJobs);

// GET /api/v1/jobs/stats - Get job statistics (must be before /:slug)
router.get('/stats', getJobStats);

// GET /api/v1/jobs/filters - Get available filter options (must be before /:slug)
router.get('/filters', getFilterOptions);

// GET /api/v1/jobs/:slug - Get a single job by slug
router.get('/:slug', getJobBySlug);

module.exports = router;
