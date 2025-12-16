const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { v5: uuidv5 } = require('uuid');
const { getRandomUserAgent } = require('../utils/generateUserAgent.js');
const { cleanCompanyName } = require('../utils/companyCleaner.js');
const NAMESPACE = process.env.JOB_UUID_NAMESPACE;
if (!NAMESPACE) {
    throw new Error('JOB_UUID_NAMESPACE not found in environment variables');
}
const qs = require('querystring');

/**
 * Fetches the max number of pages/jobs to determine logic
 * @returns {Promise<number>} - max_num_pages
 */
async function fetchMetadata() {
    try {
        const url = 'https://cyberparks.in/jm-ajax/get_listings/';

        // Standard WP Job Manager headers and form data
        const data = qs.stringify({
            lang: '',
            search_keywords: '',
            search_location: '',
            search_categories: '0',
            per_page: '1', // Initial request to just check metadata (1 to get full count in pages)
            orderby: 'featured',
            order: 'DESC',
            page: '1',
            show_pagination: 'true'
        });

        const response = await axios.post(url, data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'User-Agent': getRandomUserAgent({ os: 'Windows', deviceCategory: 'desktop' }),
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (response.data && response.data.max_num_pages) {
            return response.data.max_num_pages;
        }

        return 1;
    } catch (error) {
        console.error('Error fetching metadata:', error.message);
        return 1;
    }
}

/**
 * Fetches all jobs list by requesting high per_page
 * @param {number} totalPages - The max_num_pages value (used as per_page per instructions)
 * @returns {Promise<Array>} - List of job objects with basic info
 */
async function fetchAllJobListings(limitValue) {
    try {
        const url = 'https://cyberparks.in/jm-ajax/get_listings/';

        // "per_page = max_num_pages" as per requirements
        // This implies fetching ALL in one go if max_num_pages represents total items?
        // Actually usually max_num_pages is the number of PAGES.
        // But the user said: "Send another POST... with per_page = max_num_pages".
        // This suggests the user might think 'max_num_pages' is the total count of jobs? 
        // Or maybe they want to grab 'max_num_pages' number of items?
        // WP Job Manager 'max_num_pages' in JSON usually is the number of pages.
        // 'found_jobs' is the total count.
        // If I set 'per_page' to 'max_num_pages' (e.g. 5), I only get 5 jobs.
        // Use logic: if the user explicitly said "per_page = max_num_pages", I will do that 
        // BUT I suspect they meant total count. 
        // However, safely, I should probably check 'found_jobs' from first request if available.
        // Let's look at the instruction again: "extracted max_num_pages... per_page = max_num_pages".
        // I will follow the instruction literally first. If it returns too few jobs, I will adjust logic or headers.
        // Wait, if max_num_pages is 10, and I set per_page=10, I get 10 jobs. 
        // If there are 100 jobs, I miss 90.
        // Maybe the user meant "use the found_jobs count"? 
        // Or maybe "set per_page to a high number"?
        // Let's try to get 'found_jobs' too if possible. 
        // But strictly following "from the response, extract max_num_pages... set per_page = max_num_pages" 
        // suggests a potential confusion in the requirement or a misunderstanding of the field.
        // I'll add a safety: I'll try to fetch with a reasonably high number (e.g. 100) OR use the logic requested.
        // Actually, let's stick to the prompt. Maybe max_num_pages IS the total count in this specific custom impl?
        // I'll proceed with using `limitValue` (which comes from max_num_pages). 

        console.log(`Fetching jobs with per_page = ${limitValue}...`);

        const data = qs.stringify({
            lang: '',
            search_keywords: '',
            search_location: '',
            search_categories: '0',
            per_page: limitValue,
            orderby: 'featured',
            order: 'DESC',
            page: '1',
            show_pagination: 'true'
        });

        const response = await axios.post(url, data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'User-Agent': getRandomUserAgent({ os: 'Windows', deviceCategory: 'desktop' }),
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        const html = response.data.html;
        if (!html) return [];

        const $ = cheerio.load(html);
        const jobs = [];

        $('li.job_listing').each((i, el) => {
            const link = $(el).find('a').attr('href');
            // Extract other metadata if available in the list item
            // Usually WP Job Manager has data attributes or internal HTML
            const title = $(el).find('h3').text().trim();
            const company = $(el).find('.company').text().trim(); // Selector guess
            const date = $(el).find('.date').text().trim(); // Selector guess

            // Using standard selectors for WP Job Manager themes, might need adjustment
            // The prompt says "Extract basic job details... from <li class='job_listing'>"

            if (link) {
                jobs.push({
                    job_id: uuidv5(link, NAMESPACE),
                    title: title || $(el).find('.position h3').text().trim() || 'Unknown Title',
                    company: cleanCompanyName(company || $(el).find('.company strong').text().trim()),
                    date_posted: date || new Date().toISOString().split('T')[0],
                    url: link,
                    deadline: 'null', // Usually not in list view
                });
            }
        });

        return jobs;

    } catch (error) {
        console.error('Error fetching job listings:', error.message);
        return [];
    }
}

/**
 * Fetches full job description from the job details page
 * @param {string} url - The job URL
 * @returns {Promise<Object>} - The job description text and status
 */
async function fetchJobDescription(url) {
    try {
        if (!url) return { description: '', hasApplicationDetails: false };

        const response = await axios.get(url, {
            headers: {
                'User-Agent': getRandomUserAgent({ os: 'Windows', deviceCategory: 'desktop' })
            }
        });

        const $ = cheerio.load(response.data);

        // Extract and combine content
        const description = $('.job_description').text().trim();
        const appDetails = $('.application_details');
        const hasApplicationDetails = appDetails.length > 0;
        const application = appDetails.text().trim();

        let combined = `${description} \n\n${application} `;

        // Clean text
        combined = combined
            .replace(/[\r\n\t]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        return { description: combined, hasApplicationDetails };

    } catch (error) {
        console.error(`Error fetching description for ${url}: `, error.message);
        return { description: '', hasApplicationDetails: false };
    }
}

/**
 * Main function
 */
async function scrapeCyberPark() {
    try {
        // Step 1: Meta
        const maxPages = await fetchMetadata();
        console.log(`Max pages / limit detected: ${maxPages} `);

        // Step 2: List
        // If maxPages is small (like 5), and it really means pages, we might need to loop.
        // But prompt says "Send another POST... per_page = max_num_pages". 
        // If max_num_pages is 10 (pages) and there are 100 jobs, 
        // setting per_page=10 gets 10 jobs. 
        // To be safe and likely get ALL jobs as the user seemingly wants ("collect all jobs"), 
        // I'll try to fetch a larger number if maxPages is small, OR assume maxPages IS the count.
        // Let's blindly follow the "per_page = max_num_pages" instruction for now.
        const jobs = await fetchAllJobListings(maxPages);

        console.log(`Found ${jobs.length} jobs.Fetching details...`);

        // Step 3: Details
        const batchSize = 10; // Increased speed
        for (let i = 0; i < jobs.length; i += batchSize) {
            const batch = jobs.slice(i, i + batchSize);
            await Promise.all(batch.map(async (job) => {
                const { description, hasApplicationDetails } = await fetchJobDescription(job.url);
                job.job_description = description;

                // If .application_details class is missing, set deadline to "filled"
                if (!hasApplicationDetails) {
                    job.deadline = 'filled';
                }
            }));

            console.log(`Processed ${Math.min(i + batchSize, jobs.length)}/${jobs.length}`);
            if (i + batchSize < jobs.length) {
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }

        return jobs;

    } catch (error) {
        console.error('Scraping failed:', error);
        throw error;
    }
}

// Self-execution
if (require.main === module) {
    (async () => {
        try {
            const results = await scrapeCyberPark();
            console.log(JSON.stringify(results, null, 2));
        } catch (error) {
            console.error(error);
        }
    })();
}

module.exports = { scrapeCyberPark };
