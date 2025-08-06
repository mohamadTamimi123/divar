const puppeteer = require('puppeteer');

class DebugCrawler {
    constructor() {
        this.browser = null;
        this.page = null;
    }

    async init() {
        console.log('🚀 Launching browser for debugging...');
        
        const args = [
            '--no-sandbox', 
            '--disable-setuid-sandbox', 
            '--disable-web-security',
            '--disable-blink-features=AutomationControlled',
            '--disable-features=VizDisplayCompositor',
            '--incognito'
        ];

        this.browser = await puppeteer.launch({
            headless: false,
            executablePath: '/usr/bin/google-chrome',
            args: args,
        });

        this.page = await this.browser.newPage();
        await this.page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
        );

        await this.page.setViewport({ width: 1920, height: 1080 });
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    async debugRentPrices(link) {
        try {
            console.log(`🔍 Debugging rent prices for: ${link}`);
            
            const detailPage = await this.browser.newPage();
            
            await detailPage.setUserAgent(
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
            );

            await detailPage.goto(link, { waitUntil: 'domcontentloaded', timeout: 20000 });
            await new Promise(r => setTimeout(r, 3000));

            const debugData = await detailPage.evaluate(async () => {
                const getRowValue = (label) => {
                    const rows = document.querySelectorAll('.kt-base-row');
                    console.log(`🔍 Looking for: ${label}`);
                    console.log(`🔍 Found ${rows.length} rows`);
                    
                    for (const row of rows) {
                        const title = row.querySelector('.kt-base-row__title')?.innerText?.trim();
                        const value = row.querySelector('.kt-unexpandable-row__value')?.innerText?.trim();
                        console.log(`🔍 Row title: "${title}", value: "${value}"`);
                        if (title === label) return value;
                    }
                    return null;
                };

                // Debug all rows
                const allRows = document.querySelectorAll('.kt-base-row');
                const rowData = [];
                for (const row of allRows) {
                    const title = row.querySelector('.kt-base-row__title')?.innerText?.trim();
                    const value = row.querySelector('.kt-unexpandable-row__value')?.innerText?.trim();
                    rowData.push({ title, value });
                }

                // Debug price elements
                const priceElements = document.querySelectorAll('.kt-group-row-item__value');
                const priceData = [];
                for (const element of priceElements) {
                    const text = element.innerText.trim();
                    priceData.push(text);
                }

                // Debug convert table
                const convertTable = document.querySelector('.convert-slider table.kt-group-row');
                let convertData = null;
                if (convertTable) {
                    const rows = convertTable.querySelectorAll('tbody tr td');
                    convertData = Array.from(rows).map(row => row.innerText.trim());
                }

                // Try to find vadie and ejare
                let vadie = getRowValue('ودیعه');
                let ejare = getRowValue('اجارهٔ ماهانه');
                
                console.log(`🔍 Initial vadie: ${vadie}, ejare: ${ejare}`);

                // Look for alternative patterns
                const pageText = document.body.innerText;
                const vadieMatches = pageText.match(/(?:ودیعه|رهن)[^\d]*([\d،]+)\s*تومان/g);
                const ejareMatches = pageText.match(/(?:اجاره|ماهانه)[^\d]*([\d،]+)\s*تومان/g);

                return {
                    rowData,
                    priceData,
                    convertData,
                    vadie,
                    ejare,
                    vadieMatches,
                    ejareMatches,
                    pageText: pageText.substring(0, 1000) // First 1000 chars
                };
            });

            await detailPage.close();
            return debugData;
        } catch (error) {
            console.error(`❌ Error debugging:`, error.message);
            return null;
        }
    }

    async testLinks() {
        try {
            await this.init();
            
            const testLinks = [
                'https://divar.ir/v/%D8%A7%D8%AC%D8%A7%D8%B1%D9%87-%D8%A2%D9%BE%D8%A7%D8%B1%D8%AA%D9%85%D8%A7%D9%86-%D8%A7%D8%B5%D9%84%DB%8C-%D8%B4%D8%A7%D9%87%DB%8C%D9%86-%D9%88%DB%8C%D9%84%D8%A7-%D8%B7%D8%A8%D9%82%D9%87-%D8%A7%D9%88%D9%84/AaTWBkv2'
            ];

            for (const link of testLinks) {
                console.log(`\n🔍 Debugging: ${link}`);
                const debugData = await this.debugRentPrices(link);
                if (debugData) {
                    console.log('\n📊 Debug Results:');
                    console.log('Row Data:', debugData.rowData);
                    console.log('Price Data:', debugData.priceData);
                    console.log('Convert Data:', debugData.convertData);
                    console.log('Vadie:', debugData.vadie);
                    console.log('Ejare:', debugData.ejare);
                    console.log('Vadie Matches:', debugData.vadieMatches);
                    console.log('Ejare Matches:', debugData.ejareMatches);
                }
            }

        } catch (error) {
            console.error('❌ Error in debug:', error);
        } finally {
            await this.close();
        }
    }
}

// Run the debug
(async () => {
    console.log('🎯 Starting debug crawler...');
    const debugCrawler = new DebugCrawler();
    await debugCrawler.testLinks();
    console.log('\n🏁 Debug completed!');
})(); 