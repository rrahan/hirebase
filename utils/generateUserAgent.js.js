const userAgent = require('random-useragent');

/**
 * Generates a random user agent string
 * @param {Object} [options] - Optional configuration
 * @param {string|string[]} [options.browser] - Filter by browser (e.g., 'Chrome', 'Firefox', 'Safari')
 * @param {string|string[]} [options.os] - Filter by OS (e.g., 'Windows', 'Mac OS', 'Linux')
 * @param {string} [options.deviceCategory] - Filter by device type ('desktop', 'mobile', 'tablet')
 * @returns {string} A random user agent string
 */
function getRandomUserAgent(options = {}) {
  try {
    return userAgent.getRandom((ua) => {
      // Apply filters if provided
      if (options.browser) {
        const browsers = Array.isArray(options.browser) 
          ? options.browser 
          : [options.browser];
        return browsers.some(browser => 
          ua.browserName && ua.browserName.toLowerCase().includes(browser.toLowerCase())
        );
      }
      return true;
    });
  } catch (error) {
    console.error('Error generating user agent:', error);
    // Fallback to a common Chrome user agent
    return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  }
}

module.exports = {
  getRandomUserAgent
};