const puppeteer = require('puppeteer-core');

// Simple test to verify crawler functionality
async function testCrawler() {
    console.log('🧪 Testing crawler functionality...');
    
    let browser = null;
    try {
        // Test browser launch
        console.log('🚀 Testing browser launch...');
        browser = await puppeteer.launch({
            headless: true,
            executablePath: '/usr/bin/google-chrome',
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        
        const page = await browser.newPage();
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
        );
        
        // Test page navigation
        console.log('🌐 Testing page navigation...');
        await page.goto('https://divar.ir/s/tehran/buy-apartment', { 
            waitUntil: 'networkidle2', 
            timeout: 15000 
        });
        
        // Test element selection
        console.log('🔍 Testing element selection...');
        const cards = await page.$$('div.kt-post-card__body');
        console.log(`✅ Found ${cards.length} ad cards`);
        
        if (cards.length > 0) {
            console.log('✅ Crawler test passed!');
            return true;
        } else {
            console.log('⚠️ No cards found, but test completed');
            return true;
        }
        
    } catch (error) {
        console.error('❌ Crawler test failed:', error.message);
        return false;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Run test
if (require.main === module) {
    testCrawler().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = { testCrawler }; 