/**
 * Utility functions for Persian number extraction
 * توابع کمکی برای استخراج اعداد فارسی
 */

const PersianNumberExtractor = require('./persian_number_extractor');

// Create a singleton instance
const extractor = new PersianNumberExtractor();

/**
 * استخراج عدد از متن فارسی
 * @param {string} text - متن فارسی حاوی عدد
 * @returns {number|null} - عدد استخراج شده یا null
 */
function extractNumber(text) {
    return extractor.extractNumber(text);
}

/**
 * استخراج تمام اعداد از آبجکت داده
 * @param {Object} data - آبجکت داده
 * @returns {Object} - آبجکت با مقادیر عددی اضافه شده
 */
function extractAllNumbers(data) {
    return extractor.extractAllNumbers(data);
}

/**
 * استخراج اعداد از آرایه داده‌ها
 * @param {Array} dataArray - آرایه آبجکت‌های داده
 * @returns {Array} - آرایه با مقادیر عددی اضافه شده
 */
function extractNumbersFromArray(dataArray) {
    return extractor.extractNumbersFromArray(dataArray);
}

/**
 * تست سریع تابع
 * @param {string} text - متن برای تست
 */
function quickTest(text) {
    const result = extractNumber(text);
    console.log(`"${text}" -> ${result}`);
    return result;
}

/**
 * تبدیل مقدار طبقه به دو فیلد (current, total)
 * @param {string} tabagheText - مقدار طبقه (مثلاً "۳ از ۴" یا "۲")
 * @returns {{ current: number|null, total: number|null }}
 */
function parseTabaghe(tabagheText) {
    if (!tabagheText || typeof tabagheText !== 'string') {
        return { current: null, total: null };
    }
    // تبدیل اعداد فارسی به انگلیسی
    let cleaned = tabagheText.trim();
    const persianToEnglish = {
        '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
        '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
    };
    for (const [persian, english] of Object.entries(persianToEnglish)) {
        cleaned = cleaned.replace(new RegExp(persian, 'g'), english);
    }
    // اگر فرمت "۳ از ۴" بود
    const azMatch = cleaned.match(/(\d+)\s*از\s*(\d+)/);
    if (azMatch) {
        return {
            current: parseInt(azMatch[1]),
            total: parseInt(azMatch[2])
        };
    }
    // اگر فقط یک عدد بود
    const numMatch = cleaned.match(/(\d+)/);
    if (numMatch) {
        return {
            current: parseInt(numMatch[1]),
            total: null
        };
    }
    return { current: null, total: null };
}

// Export functions
module.exports = {
    extractNumber,
    extractAllNumbers,
    extractNumbersFromArray,
    quickTest,
    parseTabaghe
};

// Example usage
if (require.main === module) {
    console.log('🧪 Quick test of Persian number extraction:');
    console.log('===========================================');
    
    const testCases = [
        '۱۰۰،۰۰۰،۰۰۰ تومان',
        '۱۲،۰۰۰،۰۰۰ تومان',
        '۱۰۰ میلیون',
        '۸ میلیون',
        '۱.۴۵۰ میلیارد',
        'رایگان',
        '۷۵۰ میلیون',
        '۱۰۰ هزار',
        '۸۰',
        '۱۵۵'
    ];
    
    testCases.forEach(testCase => {
        quickTest(testCase);
    });
} 