const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { getRandomUserAgent } = require('../utils/generateUserAgent.js');
const { cleanCompanyName } = require('../utils/companyCleaner.js');

// Dynamic import for uuid (ES Module)
let uuidv5;
const uuidPromise = import('uuid').then(mod => {
    uuidv5 = mod.v5;
});

const NAMESPACE = process.env.JOB_UUID_NAMESPACE;
if (!NAMESPACE) {
    throw new Error('JOB_UUID_NAMESPACE not found in environment variables');
}

/**
 * Helper function to parse pagination HTML into JSON
 */
function parsePaginationHtml(htmlString) {
    if (!htmlString) {
        return {
            current_page: 1,
            total_pages: 1,
            has_next: false,
            has_prev: false
        };
    }

    const $ = cheerio.load(htmlString);

    // 1. Get Current Page (looks for class="active")
    const currentPage = parseInt($('.pagination .active .page-link').text()) || 1;

    // 2. Get Next & Prev URLs (looks for rel="next" and rel="prev")
    const nextLink = $('a[rel="next"]').attr('href') || null;
    const prevLink = $('a[rel="prev"]').attr('href') || null;

    // 3. Calculate Total Pages
    // We loop through all page numbers found to find the highest one
    let maxPage = 1;
    $('.page-link').each((i, el) => {
        const num = parseInt($(el).text());
        if (!isNaN(num) && num > maxPage) {
            maxPage = num;
        }
    });

    return {
        current_page: currentPage,
        total_pages: maxPage,
        has_next: !!nextLink,
        has_prev: !!prevLink,
        next_page_url: nextLink,
        prev_page_url: prevLink
    };
}

/**
 * Fetches job description from a job detail page
 * @param {string} jobUrl - The URL of the job detail page
 * @returns {Promise<string>} - The job description HTML/text
 */
async function fetchJobDescription(jobUrl) {
    try {
        if (!jobUrl) {
            return '';
        }

        // Ensure URL is absolute
        const fullUrl = jobUrl.startsWith('http')
            ? jobUrl
            : `https://infopark.in${jobUrl}`;

        const response = await axios.get(fullUrl, {
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'User-Agent': getRandomUserAgent({ os: 'Windows', deviceCategory: 'desktop' }),
            }
        });

        const $ = cheerio.load(response.data);
        const detailBox = $('.deatil-box');

        if (detailBox.length > 0) {
            // Extract clean text from the detail box (removes all HTML tags)
            let text = detailBox.text();

            // Clean up the text: normalize whitespace
            // Replace multiple spaces/newlines/tabs with single space
            text = text
                .replace(/[\r\n\t]+/g, ' ')  // Replace line breaks and tabs with space
                .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
                .trim();

            return text;
        }

        return '';
    } catch (error) {
        console.error(`Error fetching job description from ${jobUrl}:`, error.message);
        return '';
    }
}

/**
 * Fetches a single page of job listings from InfoPark job search API
 * @param {number} page - Page number
 * @param {string} search - Search query
 * @returns {Promise<Object>} - Page data with meta and jobs
 */
async function fetchJobsListPage({ page = 1, search = '' } = {}) {
    try {
        const url = 'https://infopark.in/companies/job-search';

        const response = await axios.get(url, {
            params: { page, search },
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest', // Crucial for getting JSON response
                'User-Agent': getRandomUserAgent({ os: 'Windows', deviceCategory: 'desktop' }),
            }
        });

        // 1. Parse Jobs HTML
        const $jobs = cheerio.load(response.data.all_jobs || '');
        const jobs = [];

        $jobs('table tbody tr').each((index, element) => {
            const cols = $jobs(element).find('td');
            if (cols.length >= 4) {
                const linkElement = $jobs(element).find('a');
                const href = linkElement.attr('href') || null;
                const jobUrl = href ? (href.startsWith('http') ? href : `https://infopark.in${href}`) : null;

                jobs.push({
                    job_id: jobUrl ? uuidv5(jobUrl, NAMESPACE) : uuidv5(JSON.stringify({ t: $jobs(cols[1]).text(), c: $jobs(cols[2]).text() }), NAMESPACE),
                    date_posted: $jobs(cols[0]).text().trim(),
                    title: $jobs(cols[1]).text().trim(),
                    company: cleanCompanyName($jobs(cols[2]).text().trim()),
                    deadline: $jobs(cols[3]).text().trim(),
                    url: jobUrl
                });
            }
        });

        // 2. Parse Pagination HTML or use meta from response
        let paginationData;
        if (response.data.meta && response.data.meta.total_pages) {
            paginationData = {
                current_page: response.data.meta.current_page || page,
                total_pages: response.data.meta.total_pages,
                total_jobs_on_page: jobs.length,
                ...response.data.meta
            };
        } else {
            paginationData = parsePaginationHtml(response.data.pagination);
            paginationData.total_jobs_on_page = jobs.length;
        }

        return {
            meta: paginationData,
            jobs
        };
    } catch (error) {
        console.error(`Error fetching jobs page ${page}:`, error.message);
        throw new Error(`Failed to fetch job listings for page ${page}.`);
    }
}

/**
 * Fetches all job listings from InfoPark job search API across all pages
 * and fetches full job descriptions for each job
 * @param {Object} options - Search options
 * @param {number} [options.page=1] - Starting page number (will fetch all pages)
 * @param {string} [options.search=''] - Search query
 * @returns {Promise<Object>} - Complete result with meta and all jobs including descriptions
 */
async function scrapeInfoPark({ page = 1, search = '' } = {}) {
    try {
        // Ensure uuid is loaded
        await uuidPromise;

        // First, fetch page 1 to get total_pages
        console.log(`Fetching page 1 to determine total pages...`);
        const firstPageResult = await fetchJobsListPage({ page: 1, search });
        const totalPages = firstPageResult.meta.total_pages || 1;

        console.log(`Found ${totalPages} total pages. Fetching all pages...`);

        // Aggregate all jobs from all pages
        let allJobs = [...firstPageResult.jobs];

        // Fetch remaining pages
        const pagePromises = [];
        for (let p = 2; p <= totalPages; p++) {
            pagePromises.push(fetchJobsListPage({ page: p, search }));
        }

        // Fetch all pages in parallel (with some rate limiting consideration)
        const pageResults = await Promise.all(pagePromises);
        pageResults.forEach(result => {
            allJobs = allJobs.concat(result.jobs);
        });

        console.log(`Fetched ${allJobs.length} jobs total. Now fetching job descriptions...`);

        // Fetch job descriptions for each job
        // Process in batches to avoid overwhelming the server
        const batchSize = 5;
        for (let i = 0; i < allJobs.length; i += batchSize) {
            const batch = allJobs.slice(i, i + batchSize);
            const descriptionPromises = batch.map(job =>
                fetchJobDescription(job.url).then(description => {
                    job.job_description = description;
                    return job;
                })
            );

            await Promise.all(descriptionPromises);
            console.log(`Fetched descriptions for jobs ${i + 1}-${Math.min(i + batchSize, allJobs.length)}/${allJobs.length}`);

            // Small delay between batches to be respectful
            if (i + batchSize < allJobs.length) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        console.log(`Completed fetching all job descriptions.`);

        return allJobs;
    } catch (error) {
        console.error('Error fetching jobs:', error.message);
        throw new Error('Failed to fetch job listings.');
    }
}

// --- Test Execution ---
if (require.main === module) {
    (async () => {
        try {
            const result = await scrapeInfoPark({ page: 1 });
            console.log(JSON.stringify(result, null, 2));
        } catch (error) {
            console.error('Error:', error.message);
        }
    })();
}

module.exports = { scrapeInfoPark };