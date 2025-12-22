/**
 * Cleans company names by removing common corporate suffixes.
 * @param {string} name - The raw company name.
 * @returns {string} - The cleaned company name.
 */
function cleanCompanyName(name) {
    if (!name) return 'Unknown Company';

    let cleaned = name;

    // List of suffixes to remove (case-insensitive)
    // Order matters: longer phrases should be matched first if they contain shorter ones
    const suffixes = [
        'Private Limited', 'Private Ltd', 'Pvt Ltd', 'Pvt. Ltd.', 'Pvt. Ltd', 'Pvt.Ltd',
        'PvtLtd', '.Pvt', 'Pvt', 'Pvt. Ltd.', 'Pvt Ltd.', 'Pvt Ltd.', '.',
        '(P) Ltd', '(P)', '(P) Ltd.', 'P(Ltd)',
        '(L) Ltd', '(L)', '(L) Ltd.', 'L(Ltd)', // Added (L) variants
        'Pvt Limited', 'Private Limited.', 'Private Ltd',
        'Public Limited', 'Pub. Ltd.',
        'Limited', 'Ltd.', 'Ltd',
        'Incorporated', 'Inc.', 'Inc',
        'Corporation', 'Corp.', 'Corp',
        'L.L.C.', 'L.L.C', 'LLC',
        'L.L.P.', 'L.L.P', 'LLP',
        'Co.', // purely "Co."
        // "Company" is tricky. Usually "The ... Company" or "... & Company".
        // Use with caution. User asked specifically for "no need eny addons otherthan company name"
        // But "The Coca-Cola Company" -> "The Coca-Cola" is okay.
        // "McKinsey & Company" -> "McKinsey &" (needs detail cleanup).
        // Let's stick to the corporate structures mainly.
    ];

    // Escape special regex characters in suffixes
    const escapedSuffixes = suffixes.map(s => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));

    // Create a regex that matches these suffixes at the end of the string
    // preceded by optional comma and whitespace
    const regex = new RegExp(`(?:,\\s*|\\s+)(?:${escapedSuffixes.join('|')})\\.?(?=$)`, 'i');

    // Remove the suffix
    cleaned = cleaned.replace(regex, '');

    // Cleanup generic "Company" if it appears as a suffix " Co" or " Co." 
    // but be careful not to remove it from "Company A"
    // The user examples: "Auberon Technology Pvt Ltd" -> "Auberon Technology"

    // Additional generic cleanup for specific "Company" word if desired?
    // Let's stick to the secure list first.

    // Remove trailing whitespace and punctuation
    return cleaned.replace(/[,.]+$/, '').trim();
}

module.exports = { cleanCompanyName };
