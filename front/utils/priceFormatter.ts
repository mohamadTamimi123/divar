/**
 * Converts Persian numbers to English numbers
 * @param str - String containing Persian numbers
 * @returns String with English numbers
 */
function persianToEnglish(str: string): string {
    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    
    let result = str;
    for (let i = 0; i < 10; i++) {
        result = result.replace(new RegExp(persianNumbers[i], 'g'), englishNumbers[i]);
    }
    return result;
}

/**
 * Formats a price value to Persian number format with تومان suffix
 * @param price - The price value (can be string or number)
 * @returns Formatted price string
 */
export function formatPrice(price: string | number | null | undefined): string {
    if (!price) return 'قیمت توافقی';
    
    // Convert to string if it's a number
    const priceStr = price.toString();
    
    // Handle "رایگان" (free) case
    if (priceStr.toLowerCase().includes('رایگان') || priceStr.toLowerCase().includes('free')) {
        return 'رایگان';
    }
    
    // Convert Persian numbers to English
    const englishPrice = persianToEnglish(priceStr);
    
    // Remove any existing تومان or other text
    const cleanPrice = englishPrice.replace(/[^\d]/g, '');
    
    if (!cleanPrice) return 'قیمت توافقی';
    
    // Convert to number and format
    const numPrice = parseInt(cleanPrice);
    if (isNaN(numPrice)) return 'قیمت توافقی';
    
    // Format with Persian numbers
    return new Intl.NumberFormat('fa-IR').format(numPrice) + ' تومان';
}

/**
 * Formats a price value to a shorter format (e.g., 1.2M تومان)
 * @param price - The price value (can be string or number)
 * @returns Formatted price string
 */
export function formatPriceShort(price: string | number | null | undefined): string {
    if (!price) return 'قیمت توافقی';
    
    // Convert to string if it's a number
    const priceStr = price.toString();
    
    // Handle "رایگان" (free) case
    if (priceStr.toLowerCase().includes('رایگان') || priceStr.toLowerCase().includes('free')) {
        return 'رایگان';
    }
    
    // Convert Persian numbers to English
    const englishPrice = persianToEnglish(priceStr);
    
    // Remove any existing تومان or other text
    const cleanPrice = englishPrice.replace(/[^\d]/g, '');
    
    if (!cleanPrice) return 'قیمت توافقی';
    
    // Convert to number
    const numPrice = parseInt(cleanPrice);
    if (isNaN(numPrice)) return 'قیمت توافقی';
    
    // Format to shorter version
    if (numPrice >= 1000000000) {
        return (numPrice / 1000000000).toFixed(1) + ' میلیارد تومان';
    } else if (numPrice >= 1000000) {
        return (numPrice / 1000000).toFixed(1) + ' میلیون تومان';
    } else if (numPrice >= 1000) {
        return (numPrice / 1000).toFixed(0) + ' هزار تومان';
    } else {
        return new Intl.NumberFormat('fa-IR').format(numPrice) + ' تومان';
    }
} 