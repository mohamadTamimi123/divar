module.exports = {
    // Cities configuration
    cities: [
        { name: 'tehran', displayName: 'تهران', slug: 'tehran' },
        { name: 'karaj', displayName: 'کرج', slug: 'karaj' }
    ],
    
    // Ad types configuration
    adTypes: [
        { name: 'sale', displayName: 'فروش', slug: 'buy-apartment' },
        { name: 'rent', displayName: 'اجاره', slug: 'rent-apartment' }
    ],
    
    // Crawler settings
    maxAdsPerType: 50,           // Maximum number of ads to crawl per type
    delayBetweenPages: 3000,     // Delay between page loads (ms)
    delayBetweenAds: 2000,       // Delay between ad processing (ms)
    headless: false,             // Run browser in headless mode
    incognito: true,             // Use incognito mode for better privacy and performance
    executablePath: '/usr/bin/google-chrome', // Chrome executable path
    
    // Timeouts
    pageLoadTimeout: 30000,      // Page load timeout (ms)
    elementWaitTimeout: 15000,   // Element wait timeout (ms)
    adProcessTimeout: 20000,     // Ad processing timeout (ms)
    
    // Output settings
    outputDir: 'output',         // Output directory
    saveIndividualFiles: true,   // Save individual city/type files
    saveCombinedFile: true,      // Save combined results file
    saveSummary: true,           // Save summary file
    
    // User agent
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
    
    // Browser arguments
    browserArgs: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-blink-features=AutomationControlled'
    ],
    
    // Viewport settings
    viewport: {
        width: 1920,
        height: 1080
    }
}; 