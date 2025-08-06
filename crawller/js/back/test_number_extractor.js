const PersianNumberExtractor = require('./persian_number_extractor');
const fs = require('fs');
const path = require('path');

/**
 * تست تابع استخراج اعداد فارسی با داده‌های واقعی
 */
async function testNumberExtractor() {
    console.log('🎯 Testing Persian Number Extractor with real data...\n');

    // Load the test data
    const testDataPath = path.join(__dirname, 'output', 'test_links_2025-08-06T09-42-50-405Z.json');
    
    if (!fs.existsSync(testDataPath)) {
        console.error('❌ Test data file not found. Please run test_specific_links.js first.');
        return;
    }

    const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf-8'));
    const extractor = new PersianNumberExtractor();

    console.log('📊 Original Data vs Extracted Numbers:');
    console.log('=====================================\n');

    testData.forEach((item, index) => {
        console.log(`🏠 Property ${index + 1}: ${item.title}`);
        console.log('----------------------------------------');
        
        // Extract numbers using our function
        const extractedData = extractor.extractAllNumbers(item);
        
        // Display results
        console.log(`📍 Location: ${item.location}`);
        console.log(`📏 Metraj: ${item.metraj} -> ${extractedData.metrajInt}`);
        console.log(`🏗️  Sal Sakht: ${item.salSakht} -> ${extractedData.salSakhtInt}`);
        console.log(`🛏️  Otagh: ${item.otagh} -> ${extractedData.otaghInt}`);
        console.log(`🏢 Tabaghe: ${item.tabaghe} -> ${extractedData.tabagheInt}`);
        console.log(`💰 Vadie: ${item.vadie} -> ${extractedData.vadieInt}`);
        console.log(`💵 Ejare: ${item.ejare} -> ${extractedData.ejareInt}`);
        
        if (item.gheymatKol) {
            console.log(`💎 Gheymat Kol: ${item.gheymatKol} -> ${extractedData.gheymatKolInt}`);
        }
        
        if (item.gheymatHarMetr) {
            console.log(`📐 Gheymat Har Metr: ${item.gheymatHarMetr} -> ${extractedData.gheymatHarMetrInt}`);
        }
        
        console.log('');
    });

    // Save the enhanced data
    const enhancedData = extractor.extractNumbersFromArray(testData);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputPath = path.join(__dirname, 'output', `enhanced_data_${timestamp}.json`);
    
    fs.writeFileSync(outputPath, JSON.stringify(enhancedData, null, 2), 'utf-8');
    console.log(`💾 Enhanced data saved to: ${path.basename(outputPath)}`);

    // Show summary statistics
    console.log('\n📈 Summary Statistics:');
    console.log('=====================');
    
    const vadieValues = enhancedData.map(item => item.vadieInt).filter(val => val !== null);
    const ejareValues = enhancedData.map(item => item.ejareInt).filter(val => val !== null);
    const metrajValues = enhancedData.map(item => item.metrajInt).filter(val => val !== null);

    if (vadieValues.length > 0) {
        const avgVadie = Math.round(vadieValues.reduce((a, b) => a + b, 0) / vadieValues.length);
        const minVadie = Math.min(...vadieValues);
        const maxVadie = Math.max(...vadieValues);
        console.log(`💰 Vadie - Avg: ${avgVadie.toLocaleString()}, Min: ${minVadie.toLocaleString()}, Max: ${maxVadie.toLocaleString()}`);
    }

    if (ejareValues.length > 0) {
        const avgEjare = Math.round(ejareValues.reduce((a, b) => a + b, 0) / ejareValues.length);
        const minEjare = Math.min(...ejareValues);
        const maxEjare = Math.max(...ejareValues);
        console.log(`💵 Ejare - Avg: ${avgEjare.toLocaleString()}, Min: ${minEjare.toLocaleString()}, Max: ${maxEjare.toLocaleString()}`);
    }

    if (metrajValues.length > 0) {
        const avgMetraj = Math.round(metrajValues.reduce((a, b) => a + b, 0) / metrajValues.length);
        const minMetraj = Math.min(...metrajValues);
        const maxMetraj = Math.max(...metrajValues);
        console.log(`📏 Metraj - Avg: ${avgMetraj}, Min: ${minMetraj}, Max: ${maxMetraj}`);
    }

    console.log('\n✅ Number extraction completed successfully!');
}

// Run the test
if (require.main === module) {
    testNumberExtractor().catch(console.error);
}

module.exports = { testNumberExtractor }; 