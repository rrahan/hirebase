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
 * Helper to get headers with a random User-Agent
 */
function getHeaders() {
    return {
        'User-Agent': getRandomUserAgent({ os: 'Windows', deviceCategory: 'desktop' }),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    };
}

/**
 * Scrapes the listing page for basic job info
 */
async function fetchJobLisitings() {
    try {
        const url = 'https://smartcity-kochi.in/media-hub/job-openings/';
        const response = await axios.get(url, { headers: getHeaders() });
        const $ = cheerio.load(response.data);
        const jobs = [];

        $('.vcex-recent-news-entry').each((i, el) => {
            const article = $(el);

            // 1. Valid Link
            const linkTag = article.find('h2 a');
            if (!linkTag.length) return;

            const jobUrl = linkTag.attr('href');
            const fullText = linkTag.text().trim(); // e.g. "Customer Support Executive | KeyValue | SmartCity Kochi"

            // 2. Parse Title | Company
            // Default fallbacks
            let title = fullText;
            let company = 'Unknown Company';

            // Try pipe split first
            if (fullText.includes('|')) {
                const parts = fullText.split('|').map(s => s.trim());
                if (parts.length >= 2) {
                    title = parts[0];
                    company = cleanCompanyName(parts[1]);
                }
            } else if (fullText.includes(' @ ')) {
                // Handle "Title @ Company, Location" format
                const parts = fullText.split(' @ ').map(s => s.trim());
                if (parts.length >= 2) {
                    title = parts[0];
                    company = cleanCompanyName(parts[1].replace(/,?\s*SmartCity.*$/i, '').trim());
                }
            } else if (fullText.toLowerCase().includes(' at ')) {
                // Handle "Title at Company, Location" format
                const parts = fullText.split(/ at /i).map(s => s.trim());
                if (parts.length >= 2) {
                    title = parts[0];
                    // Remove trailing location info (e.g. ", SmartCity Kochi")
                    company = cleanCompanyName(parts[1].replace(/,?\s*SmartCity.*$/i, '').trim());
                }
            }

            // 3. Parse Date
            // Structure: .vcex-recent-news-date -> .day (27) .month (Mar 25)
            const day = article.find('.vcex-recent-news-date__day').text().trim();
            const monthYear = article.find('.vcex-recent-news-date__month').text().trim();
            let datePosted = null;
            if (day && monthYear) {
                datePosted = `${day} ${monthYear}`; // e.g. "27 Mar 25"
            }

            jobs.push({
                job_id: uuidv5(jobUrl, NAMESPACE),
                date_posted: datePosted,
                title,
                company,
                deadline: null, // Not provided in list usually
                url: jobUrl,
                job_description: '' // To be filled
            });
        });

        return jobs;
    } catch (error) {
        console.error('Error fetching listings:', error.message);
        return [];
    }
}

/**
 * Fetches full description from valid CSS classes
 * @param {string} url 
 * @returns {Promise<string>}
 */
async function fetchJobDescription(url) {
    try {
        if (!url) return '';
        const response = await axios.get(url, { headers: getHeaders() });
        const $ = cheerio.load(response.data);

        // Based on user examples, content is contained in .wpb_text_column elements
        // specifically inside the inner .wpb_wrapper
        // We filter out the specific boilerplate block which seems to be a separate element
        const wrapperText = $('.wpb_text_column .wpb_wrapper')
            .map((i, el) => $(el).text().trim())
            .get()
            .filter(text => !text.includes('Welcome to SmartCity Kochi') && !text.includes('Get In Touch Our Location'))
            .join('\n\n');

        // No need for separate .elementToProof search as it's inside wpb_text_column in the examples
        let combined = wrapperText;

        // Clean
        combined = combined
            .replace(/Welcome\s+to\s+SmartCity\s+Kochi[\s\S]*?Get\s+In\s+Touch\s+Our\s+Location/gi, '')
            .replace(/Get\s+In\s+Touch\s+Our\s+Location/gi, '')
            .replace(/[\r\n\t]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        return combined;

    } catch (error) {
        console.error(`Error fetching description for ${url}:`, error.message);
        return '';
    }
}

/**
 * Main Scraper
 */
async function scrapeSmartCity() {
    try {
        console.log('Fetching job listings...');
        const jobs = await fetchJobLisitings();
        console.log(`Found ${jobs.length} jobs. Fetching details...`);

        // Batch processing
        const batchSize = 5;
        for (let i = 0; i < jobs.length; i += batchSize) {
            const batch = jobs.slice(i, i + batchSize);
            await Promise.all(batch.map(async (job) => {
                job.job_description = await fetchJobDescription(job.url);
            }));

            console.log(`Processed ${Math.min(i + batchSize, jobs.length)}/${jobs.length}`);
            if (i + batchSize < jobs.length) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        return jobs;

    } catch (error) {
        console.error('Error in scrapeSmartCity:', error);
        return [];
    }
}

// Self-execution
if (require.main === module) {
    (async () => {
        const results = await scrapeSmartCity();
        console.log(JSON.stringify(results, null, 2));
    })();
}

module.exports = { scrapeSmartCity };
