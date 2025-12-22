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

/**
 * Standard headers defined by user requirements
 */
const BASE_HEADERS = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Pragma': 'no-cache',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
    'sec-ch-ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"'
};

/**
 * Helper to get headers with a random User-Agent
 */
function getHeaders() {
    return {
        ...BASE_HEADERS,
        'User-Agent': getRandomUserAgent({ os: 'Windows', deviceCategory: 'desktop' })
    };
}

/**
 * Fetches the maximum offset (last page index) from the pagination
 * @returns {Promise<number>} - The max offset (e.g. 30)
 */
async function fetchMaxOffset() {
    try {
        const url = 'https://www.ulcyberpark.com/jobs/';
        const response = await axios.get(url, { headers: getHeaders() });

        const $ = cheerio.load(response.data);
        const lastLink = $('li[title="last"] a').attr('href');

        if (lastLink) {
            // Extract the number from the end of url (e.g. .../index/30)
            const parts = lastLink.split('/');
            const lastPart = parts[parts.length - 1];
            const offset = parseInt(lastPart, 10);
            return isNaN(offset) ? 0 : offset;
        }

        return 0;
    } catch (error) {
        console.error('Error fetching max offset:', error.message);
        return 0;
    }
}

/**
 * Fetches jobs from a specific offset page
 * @param {number} offset - Pagination offset (0, 10, 20...)
 * @returns {Promise<Array>} - List of job objects
 */
async function fetchJobsFromPage(offset) {
    try {
        const url = `https://www.ulcyberpark.com/jobs/index/${offset}`;
        const response = await axios.get(url, { headers: getHeaders() });

        const $ = cheerio.load(response.data);
        const jobs = [];

        // Selecting the table rows
        $('table tr').each((i, row) => {
            const cols = $(row).find('td');
            if (cols.length > 0) {
                // Formatting based on user snippet:
                // Col 0: Title link (.btn-1) + <br> + Valid closing date span
                // Col 1: Company link
                // Col 2: View Details link

                // 1. Title & List-Deadline from Col 0
                const col0 = $(cols[0]);
                const title = col0.find('a.btn-1').first().text().trim() || 'Unknown Title';
                const closureText = col0.find('span').text().trim(); // e.g. "closing date: 31-12-2025"
                let listDeadline = '';
                if (closureText.toLowerCase().includes('closing date')) {
                    listDeadline = closureText.replace(/closing date\s*:\s*/i, '').trim();
                }

                // 2. Company from Col 1
                const company = cleanCompanyName($(cols[1]).text().trim());

                // 3. URL from Col 2 (View Details)
                const viewLink = $(cols[2]).find('a');
                if (viewLink.length > 0) {
                    const partialUrl = viewLink.attr('href');
                    const fullUrl = partialUrl.startsWith('http') ? partialUrl : `https://www.ulcyberpark.com/jobs/${partialUrl}`;

                    jobs.push({
                        id: uuidv5(fullUrl, NAMESPACE), // Internal unique
                        job_id: uuidv5(fullUrl, NAMESPACE), // Output requirement
                        title,
                        company,
                        deadline: listDeadline, // Placeholder, will be refined in details
                        date_posted: null,     // Req: null
                        url: fullUrl
                    });
                }
            }
        });

        return jobs;

    } catch (error) {
        console.error(`Error fetching page offset ${offset}:`, error.message);
        return [];
    }
}

/**
 * Fetches job description details
 * @param {string} url 
 * @returns {Promise<Object>} - Contains description and refined deadline
 */
async function fetchJobDescription(url) {
    try {
        if (!url) return { description: '', deadline: '' };

        const response = await axios.get(url, { headers: getHeaders() });
        const $ = cheerio.load(response.data);

        // Req: .job_title, .ul_type.bt_padd, .email_title
        // Also capturing .ul_type (without bt_padd) as it often contains the description body in the snippet
        const titleHeaders = $('.job_title').map((i, el) => $(el).text().trim()).get();
        const contentLists = $('.ul_type').map((i, el) => $(el).text().trim()).get();
        const emailTitle = $('.email_title').text().trim();

        // combine all text parts
        const combinedText = [
            ...titleHeaders,
            ...contentLists,
            emailTitle
        ].filter(Boolean).join('\n\n');

        // Extract Deadline from Sub-title if available
        // Snippet: <h4 class="sub_title">Closing date :31-12-2025</h4>
        let deadline = '';
        const subTitle = $('.sub_title').text().trim();
        if (subTitle && subTitle.toLowerCase().includes('closing date')) {
            deadline = subTitle.replace(/closing date\s*:\s*/i, '').trim();
        }

        // Clean
        const cleanDescription = combinedText
            .replace(/[\r\n\t]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        return { description: cleanDescription, deadline };

    } catch (error) {
        console.error(`Error fetching details for ${url}:`, error.message);
        return { description: '', deadline: '' };
    }
}

/**
 * Main scraper function
 */
async function scrapeULCyberPark() {
    try {
        const maxOffset = await fetchMaxOffset();
        console.log(`Max offset detected: ${maxOffset}`);

        let allJobs = [];

        // Iterate offsets: 0, 10, 20 ... maxOffset
        for (let offset = 0; offset <= maxOffset; offset += 10) {
            console.log(`Fetching jobs at offset ${offset}...`);
            const jobs = await fetchJobsFromPage(offset);
            allJobs = allJobs.concat(jobs);

            // Polite delay
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log(`Found ${allJobs.length} jobs. Fetching details...`);

        // Fetch details in batches
        const batchSize = 10;
        for (let i = 0; i < allJobs.length; i += batchSize) {
            const batch = allJobs.slice(i, i + batchSize);
            await Promise.all(batch.map(async (job) => {
                const { description, deadline } = await fetchJobDescription(job.url);

                job.job_description = description;

                // If details page has deadline, override the one from list
                if (deadline) {
                    job.deadline = deadline;
                }

                delete job.id; // Cleanup internal ID
            }));

            console.log(`Processed ${Math.min(i + batchSize, allJobs.length)}/${allJobs.length}`);
            if (i + batchSize < allJobs.length) {
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }

        return allJobs;

    } catch (error) {
        console.error('Error in scrapeULCyberPark:', error);
        throw error;
    }
}

// Self-execution
if (require.main === module) {
    (async () => {
        try {
            const results = await scrapeULCyberPark();
            console.log(JSON.stringify(results, null, 2));
        } catch (error) {
            console.error(error);
        }
    })();
}

module.exports = { scrapeULCyberPark };
