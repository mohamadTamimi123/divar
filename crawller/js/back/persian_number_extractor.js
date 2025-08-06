/**
 * تابع استخراج مقادیر عددی از متن فارسی
 * Persian Number Extractor Function
 */

class PersianNumberExtractor {
    constructor() {
        // Persian to English digit mapping
        this.persianToEnglish = {
            '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
            '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
        };

        // Multiplier mappings
        this.multipliers = {
            'میلیارد': 1000000000,
            'billion': 1000000000,
            'میلیون': 1000000,
            'million': 1000000,
            'هزار': 1000,
            'thousand': 1000
        };

        // Common text to remove
        this.textToRemove = [
            'تومان', 'تومن', 'ریال', 'ریل', 'رایگان', 'مجانی', 'رایگان است',
            'قابل مذاکره', 'توافقی', 'تماس بگیرید', 'تماس حاصل فرمایید'
        ];
    }

    /**
     * تبدیل متن فارسی به عدد
     * @param {string} text - متن فارسی حاوی عدد
     * @returns {number|null} - عدد استخراج شده یا null
     */
    extractNumber(text) {
        if (!text || typeof text !== 'string') {
            return null;
        }

        // Remove common text
        let cleaned = text.trim();
        for (const removeText of this.textToRemove) {
            cleaned = cleaned.replace(new RegExp(removeText, 'gi'), '');
        }

        // Convert Persian digits to English
        for (const [persian, english] of Object.entries(this.persianToEnglish)) {
            cleaned = cleaned.replace(new RegExp(persian, 'g'), english);
        }

        // Handle multipliers
        let multiplier = 1;
        let multiplierFound = false;
        
        for (const [multiplierText, multiplierValue] of Object.entries(this.multipliers)) {
            if (cleaned.includes(multiplierText)) {
                multiplier = multiplierValue;
                cleaned = cleaned.replace(new RegExp(multiplierText, 'gi'), '');
                multiplierFound = true;
                break;
            }
        }

        // Handle decimal numbers (like 1.450)
        const decimalMatch = cleaned.match(/(\d+\.\d+)/);
        if (decimalMatch) {
            const decimalValue = parseFloat(decimalMatch[1]);
            if (multiplierFound) {
                return Math.round(decimalValue * multiplier);
            } else {
                // If no multiplier found but decimal exists, assume it's already in the correct unit
                return Math.round(decimalValue);
            }
        }

        // Handle "از" format (like "۳ از ۴" for tabaghe)
        const azMatch = cleaned.match(/(\d+)\s*از\s*(\d+)/);
        if (azMatch) {
            // Return the first number (current floor)
            return parseInt(azMatch[1]);
        }

        // Remove all non-digit and non-comma characters except dots
        cleaned = cleaned.replace(/[^\d,.]/g, '');
        
        // Handle comma-separated numbers
        if (cleaned.includes(',')) {
            // Remove commas and convert to number
            const cleanNumber = cleaned.replace(/,/g, '');
            const number = parseInt(cleanNumber);
            if (!isNaN(number)) {
                return number * multiplier;
            }
        }

        // Handle simple numbers
        const numberMatch = cleaned.match(/(\d+)/);
        if (numberMatch) {
            const number = parseInt(numberMatch[1]);
            if (!isNaN(number)) {
                return number * multiplier;
            }
        }

        return null;
    }

    /**
     * استخراج مقادیر عددی از آبجکت داده
     * @param {Object} data - آبجکت داده
     * @returns {Object} - آبجکت با مقادیر عددی اضافه شده
     */
    extractAllNumbers(data) {
        const result = { ...data };

        // Extract numbers from common fields
        if (data.vadie) {
            result.vadieInt = this.extractNumber(data.vadie);
        }

        if (data.ejare) {
            result.ejareInt = this.extractNumber(data.ejare);
        }

        if (data.gheymatKol) {
            result.gheymatKolInt = this.extractNumber(data.gheymatKol);
        }

        if (data.gheymatHarMetr) {
            result.gheymatHarMetrInt = this.extractNumber(data.gheymatHarMetr);
        }

        if (data.metraj) {
            result.metrajInt = this.extractNumber(data.metraj);
        }

        if (data.salSakht) {
            result.salSakhtInt = this.extractNumber(data.salSakht);
        }

        if (data.otagh) {
            result.otaghInt = this.extractNumber(data.otagh);
        }

        if (data.tabaghe) {
            result.tabagheInt = this.extractNumber(data.tabaghe);
        }

        return result;
    }

    /**
     * استخراج مقادیر عددی از آرایه داده‌ها
     * @param {Array} dataArray - آرایه آبجکت‌های داده
     * @returns {Array} - آرایه با مقادیر عددی اضافه شده
     */
    extractNumbersFromArray(dataArray) {
        if (!Array.isArray(dataArray)) {
            return [];
        }

        return dataArray.map(item => this.extractAllNumbers(item));
    }

    /**
     * تست تابع با نمونه‌های مختلف
     */
    test() {
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
            '۱۵۵',
            '۱۳۸۸'
        ];

        console.log('🧪 Testing Persian Number Extractor:');
        console.log('=====================================');
        
        testCases.forEach(testCase => {
            const result = this.extractNumber(testCase);
            console.log(`"${testCase}" -> ${result}`);
        });
    }
}

// Export the class
module.exports = PersianNumberExtractor;

// If running directly, run tests
if (require.main === module) {
    const extractor = new PersianNumberExtractor();
    extractor.test();
} 