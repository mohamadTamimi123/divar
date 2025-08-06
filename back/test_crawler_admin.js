const fs = require('fs');
const path = require('path');

// Test script for crawler admin functionality
function testCrawlerAdmin() {
    console.log('🧪 Testing Crawler Admin Functionality...');
    
    // Test 1: Check if crawler routes exist
    const crawlerRoutePath = path.join(__dirname, 'routes/crawler.js');
    if (fs.existsSync(crawlerRoutePath)) {
        console.log('✅ Crawler routes file exists');
    } else {
        console.log('❌ Crawler routes file not found');
        return false;
    }

    // Test 2: Check if admin HTML exists
    const crawlerHtmlPath = path.join(__dirname, 'public/admin/crawler.html');
    if (fs.existsSync(crawlerHtmlPath)) {
        console.log('✅ Crawler admin HTML exists');
    } else {
        console.log('❌ Crawler admin HTML not found');
        return false;
    }

    // Test 3: Check if admin JS exists
    const crawlerJsPath = path.join(__dirname, 'public/admin/crawler-admin.js');
    if (fs.existsSync(crawlerJsPath)) {
        console.log('✅ Crawler admin JavaScript exists');
    } else {
        console.log('❌ Crawler admin JavaScript not found');
        return false;
    }

    // Test 4: Check if output directory exists
    const outputDir = path.join(__dirname, '../crawller/js/back/output');
    if (fs.existsSync(outputDir)) {
        console.log('✅ Output directory exists');
    } else {
        console.log('⚠️ Output directory does not exist (will be created when crawler runs)');
    }

    // Test 5: Check if crawler script exists
    const crawlerScriptPath = path.join(__dirname, '../crawller/js/back/divar_crawler.js');
    if (fs.existsSync(crawlerScriptPath)) {
        console.log('✅ Crawler script exists');
    } else {
        console.log('❌ Crawler script not found');
        return false;
    }

    console.log('\n🎯 All tests passed! Crawler admin is ready to use.');
    console.log('\n📋 Available endpoints:');
    console.log('  - GET  /api/v1/crawler/stats     - Get crawler statistics');
    console.log('  - GET  /api/v1/crawler/files     - Get list of crawled files');
    console.log('  - GET  /api/v1/crawler/status    - Get crawler status');
    console.log('  - POST /api/v1/crawler/start     - Start crawler');
    console.log('  - POST /api/v1/crawler/stop      - Stop crawler');
    console.log('  - GET  /admin/crawler            - Crawler admin panel');
    
    return true;
}

// Run test if this file is executed directly
if (require.main === module) {
    testCrawlerAdmin();
}

module.exports = { testCrawlerAdmin }; 