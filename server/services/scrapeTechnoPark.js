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
 * Fetches the total number of pages from the TechnoPark API
 * @returns {Promise<number>} - Total pages
 */
async function fetchTotalPages() {
    try {
        console.log('Fetching total pages...');
        // Request a very high page number to get the last_page info from the API response
        const url = 'https://technopark.in/api/paginated-jobs?page=1000&search=&type=';
        const response = await axios.get(url, {
            headers: {
                'User-Agent': getRandomUserAgent({ os: 'Windows', deviceCategory: 'desktop' })
            }
        });

        // The API returns metadata including last_page
        if (response.data && response.data.last_page) {
            console.log(`Total pages found: ${response.data.last_page}`);
            return response.data.last_page;
        }

        return 1;
    } catch (error) {
        console.error('Error fetching total pages:', error.message);
        return 1;
    }
}

/**
 * Fetches jobs from a specific page
 * @param {number} page - Page number
 * @returns {Promise<Array>} - List of basic job objects
 */
async function fetchJobsFromPage(page) {
    try {
        const url = `https://technopark.in/api/paginated-jobs?page=${page}&search=&type=`;
        const response = await axios.get(url, {
            headers: {
                'User-Agent': getRandomUserAgent({ os: 'Windows', deviceCategory: 'desktop' })
            }
        });

        if (response.data && response.data.data) {
            return response.data.data;
        }

        return [];
    } catch (error) {
        console.error(`Error fetching jobs from page ${page}:`, error.message);
        return [];
    }
}

/**
 * Fetches full job description from the job details page
 * @param {number|string} jobId - The job ID from TechnoPark (used in URL)
 * @returns {Promise<string>} - The HTML job description
 */
async function fetchJobDescription(jobId) {
    try {
        if (!jobId) return '';

        const url = `https://technopark.in/job-details/${jobId}`;
        const response = await axios.get(url, {
            headers: {
                'User-Agent': getRandomUserAgent({ os: 'Windows', deviceCategory: 'desktop' })
            }
        });

        const $ = cheerio.load(response.data);

        // Extract content from the specific class found in the HTML provided
        // Selector: ._mce-content-body_silut_1
        const descriptionBlock = $('._mce-content-body_silut_1');

        if (descriptionBlock.length > 0) {
            let text = descriptionBlock.text();
            text = text
                .replace(/[\r\n\t]+/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();

            // Extract contact email
            // Look for the specific span containing "Contact Email:"
            const contactEmailSpan = $('span:contains("Contact Email:")');
            if (contactEmailSpan.length > 0) {
                const emailLink = contactEmailSpan.find('a');
                if (emailLink.length > 0) {
                    const email = emailLink.text().trim();
                    if (email) {
                        text += `\n\nContact Email: ${email}`;
                    }
                }
            } else {
                // Fallback: try finding any mailto link
                const mailto = $('a[href^="mailto:"]').first();
                if (mailto.length > 0) {
                    const email = mailto.text().trim();
                    if (email && email.includes('@')) {
                        text += `\n\nContact Email: ${email}`;
                    }
                }
            }

            return text;
        }

        return '';
    } catch (error) {
        console.error(`Error fetching description for job ${jobId}:`, error.message);
        return '';
    }
}

/**
 * Main function to scrape TechnoPark jobs
 */
async function scrapeTechnoPark(options = {}) {
    try {
        // Ensure uuid is loaded
        await uuidPromise;

        let totalPages = await fetchTotalPages();
        if (options.limitPages) {
            console.log(`Limiting scrape to ${options.limitPages} pages for testing.`);
            totalPages = Math.min(totalPages, options.limitPages);
        }

        let allJobs = [];

        console.log(`Starting scrape for ${totalPages} pages...`);

        // Loop through all pages
        for (let page = 1; page <= totalPages; page++) {
            console.log(`Fetching page ${page}/${totalPages}...`);
            const jobsOnPage = await fetchJobsFromPage(page);

            // Transform to our format and add to list (will add description later)
            // The API response fields mapping (based on typical Laravel/JSON responses and the HTML view):
            // We need to check actual API response keys, but assuming standard ones from the context:
            // id, job_title, company_name (found in 'company' object usually), closing_date, etc.
            // Let's map what we can see from the HTML dump provided ("job_title", "company", "closing_date")
            // The provided HTML had a JSON props script too: "job_listing":{...}
            // "job_title", "company": { "company": "..." }, "closing_date"

            const processedJobs = jobsOnPage.map(job => ({
                id: job.id, // Keep original ID for detail fetching
                job_id: uuidv5(`https://technopark.in/job-details/${job.id}`, NAMESPACE),
                date_posted: job.posted_date || new Date().toISOString().split('T')[0], // Fallback
                title: job.job_title,
                company: cleanCompanyName(job.company ? job.company.company : (job.company_name || 'Unknown')),
                deadline: job.closing_date,
                url: `https://technopark.in/job-details/${job.id}`,
                // Description to be added
            }));

            allJobs = allJobs.concat(processedJobs);
        }

        console.log(`fetched ${allJobs.length} basic job listings. Fetching descriptions...`);

        // Fetch descriptions with concurrency control
        const batchSize = 5;
        for (let i = 0; i < allJobs.length; i += batchSize) {
            const batch = allJobs.slice(i, i + batchSize);

            await Promise.all(batch.map(async (job) => {
                const description = await fetchJobDescription(job.id);
                job.job_description = description;
                delete job.id; // Remove the internal TechnoPark ID from final output
            }));

            console.log(`Processed descriptions for jobs ${i + 1}-${Math.min(i + batchSize, allJobs.length)}`);

            // Polite delay
            if (i + batchSize < allJobs.length) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        return allJobs;

    } catch (error) {
        console.error('Scraping failed:', error);
        throw error;
    }
}

// Self-execution block for testing
if (require.main === module) {
    (async () => {
        try {
            const results = await scrapeTechnoPark();
            console.log(JSON.stringify(results, null, 2));
        } catch (error) {
            console.error(error);
        }
    })();
}

module.exports = { scrapeTechnoPark };
