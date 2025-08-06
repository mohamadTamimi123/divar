const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { extractAllNumbers, parseTabaghe } = require('./persian_number_utils');

class TestCrawler {
    constructor() {
        this.browser = null;
        this.page = null;
    }

    async init() {
        console.log('🚀 Launching browser for testing...');
        
        const args = [
            '--no-sandbox', 
            '--disable-setuid-sandbox', 
            '--disable-web-security',
            '--disable-blink-features=AutomationControlled',
            '--disable-features=VizDisplayCompositor',
            '--incognito'
        ];

        this.browser = await puppeteer.launch({
            headless: false, // Set to false for testing
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

    async extractAdDetails(link) {
        try {
            console.log(`🔍 Testing link: ${link}`);
            
            const detailPage = await this.browser.newPage();
            
            await detailPage.setUserAgent(
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
            );

            await detailPage.goto(link, { waitUntil: 'domcontentloaded', timeout: 20000 });
            await new Promise(r => setTimeout(r, 3000));

            const data = await detailPage.evaluate(async () => {
                // Scroll to load all content
                await new Promise((resolve) => {
                    let totalHeight = 0;
                    const distance = 300;
                    const timer = setInterval(() => {
                        const scrollHeight = document.body.scrollHeight;
                        window.scrollBy(0, distance);
                        totalHeight += distance;
                        if (totalHeight >= scrollHeight) {
                            clearInterval(timer);
                            resolve();
                        }
                    }, 200);
                });

                const getRowValue = (label) => {
                    const rows = document.querySelectorAll('.kt-base-row');
                    for (const row of rows) {
                        const title = row.querySelector('.kt-base-row__title')?.innerText?.trim();
                        const value = row.querySelector('.kt-unexpandable-row__value')?.innerText?.trim();
                        if (title === label) return value;
                    }
                    return null;
                };

                const values = document.querySelectorAll('td.kt-group-row-item--info-row');
                const values2 = document.querySelectorAll('.kt-group-row-item.kt-group-row-item__value.kt-body.kt-body--stable');

                const descriptionEl = document.querySelector('.kt-description-row__text.kt-description-row__text--primary');
                const location = document.querySelector('.kt-page-title__subtitle.kt-page-title__subtitle--responsive-sized');

                const imageConfirmation = getRowValue('تصویر‌ها برای همین ملک است؟');
                let imageLinks = [];

                if (imageConfirmation === 'بله') {
                    const imageElements = document.querySelectorAll('.kt-image-block__image.kt-image-block__image--fading');
                    imageLinks = Array.from(imageElements).map(img => img.getAttribute('src')).filter(src => src);
                }

                const mapLocation = document.querySelector('.kt-show-map__link')?.getAttribute('href') || null;

                // Extract price information based on ad type - using mian4.js logic
                let priceData = {};
                const convertTable = document.querySelector('.convert-slider table.kt-group-row');
                const ghabeleTabdil = !!convertTable;

                // Check if this is a rent ad
                const isRentAd = window.location.href.includes('rent') || 
                                window.location.href.includes('اجاره') || 
                                document.querySelector('h1')?.innerText?.includes('اجاره') ||
                                !!convertTable; // If convertTable exists, it's likely a rent ad

                if (isRentAd) {
                    // Rental ad - using mian4.js logic exactly
                    let vadie = null;
                    let ejare = null;
                    
                    if (convertTable) {
                        const rows = convertTable.querySelectorAll('tbody tr td');
                        vadie = rows[0]?.innerText.trim() || null;
                        ejare = rows[1]?.innerText.trim() || null;
                    } else {
                        vadie = getRowValue('ودیعه');
                        ejare = getRowValue('اجارهٔ ماهانه');
                    }
                    
                    priceData = { 
                        vadie: vadie, 
                        ejare: ejare, 
                        ghabeleTabdil 
                    };
                } else {
                    // Sale ad
                    priceData = {
                        gheymatKol: getRowValue('قیمت کل'),
                        gheymatHarMetr: getRowValue('قیمت هر متر'),
                        ghabeleTabdil: false
                    };
                }

                return {
                    title: document.querySelector('h1')?.innerText || '',
                    metraj: values[0]?.innerText.trim() || null,
                    salSakht: values[1]?.innerText.trim() || null,
                    otagh: values[2]?.innerText.trim() || null,
                    tabaghe: getRowValue('طبقه'),
                    parking: values2[0]?.innerText.trim() || null,
                    asansor: values2[1]?.innerText.trim() || null,
                    anbari: values2[2]?.innerText.trim() || null,
                    tozihat: descriptionEl?.innerText?.trim() || null,
                    location: location?.innerText?.trim() || null,
                    imageLinks,
                    imageConfirmation,
                    mapLocation,
                    vadie: priceData.vadie || null,
                    ejare: priceData.ejare || null,
                    gheymatKol: priceData.gheymatKol || null,
                    gheymatHarMetr: priceData.gheymatHarMetr || null,
                    ghabeleTabdil: priceData.ghabeleTabdil || false,
                    url: window.location.href,
                    scrapedAt: new Date().toISOString(),
                    city: 'test',
                    adType: isRentAd ? 'rent' : 'sale'
                };
            });

            await detailPage.close();
            
            // Extract numeric values using our Persian number extractor
            const enhancedData = extractAllNumbers(data);
            
            return enhancedData;
        } catch (error) {
            console.error(`❌ Error extracting ad details:`, error.message);
            return null;
        }
    }

    async testLinks() {
        try {
            await this.init();
            
            const testLinks = [
                'https://divar.ir/v/%D8%A7%D8%AC%D8%A7%D8%B1%D9%87-%D8%A2%D9%BE%D8%A7%D8%B1%D8%AA%D9%85%D8%A7%D9%86-%D8%A7%D8%B5%D9%84%DB%8C-%D8%B4%D8%A7%D9%87%DB%8C%D9%86-%D9%88%DB%8C%D9%84%D8%A7-%D8%B7%D8%A8%D9%82%D9%87-%D8%A7%D9%88%D9%84/AaTWBkv2',
                'https://divar.ir/v/85%D9%85%D8%AA%D8%B1%DB%8C-%D8%B1%D9%88%D8%A8%D9%87-%D9%86%D9%85%D8%A7-%D9%84%D9%88%DA%A9%DB%8C%D8%B4%D9%86-%DA%86%D9%86%D8%AF-%D9%82%D8%AF%D9%85%DB%8C-%D8%A8%D9%84%D9%88%D8%A7%D8%B1-%D8%A8%D8%A7%D8%BA%D8%B3%D8%AA%D8%A7%D9%86/AaGWE5iK',
                'https://divar.ir/v/155%D9%85%D8%AA%D8%B1-%D8%AE%D9%88%D8%B4-%D9%86%D9%82%D8%B4%D9%87-%D9%85%DB%8C%D8%AF%D8%A7%D9%86-%D8%A7%D8%B3%D8%A8%DB%8C/AaTCyHdG',
                'https://divar.ir/v/%D8%A7%D8%AC%D8%A7%D8%B1%D9%87-%D9%88%D8%A7%D8%AD%D8%AF-%DB%B9%DB%B5-%D9%85%D8%AA%D8%B1%DB%8C-%D8%AA%DA%A9-%D9%88%D8%A7%D8%AD%D8%AF%DB%8C/AaTaB22F'
            ];

            const results = [];
            
            for (const link of testLinks) {
                console.log(`\n🔍 Testing: ${link}`);
                const data = await this.extractAdDetails(link);
                if (data) {
                    results.push(data);
                    console.log('✅ Successfully extracted data:');
                    console.log(`   Title: ${data.title}`);
                    console.log(`   Metraj: ${data.metraj} -> ${data.metrajInt}`);
                    console.log(`   Vadie: ${data.vadie} -> ${data.vadieInt}`);
                    console.log(`   Ejare: ${data.ejare} -> ${data.ejareInt}`);
                    console.log(`   Location: ${data.location}`);
                    console.log(`   Tabaghe: ${data.tabaghe} -> ${data.tabagheInt}`);
                    // نمایش طبقه به صورت current و total
                    const tabagheParsed = parseTabaghe(data.tabaghe);
                    console.log(`   Tabaghe (parsed): current=${tabagheParsed.current}, total=${tabagheParsed.total}`);
                } else {
                    console.log('❌ Failed to extract data');
                }
            }

            // Save results
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const outputDir = path.join(__dirname, 'output');
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            const filename = `test_links_${timestamp}.json`;
            const filepath = path.join(outputDir, filename);
            
            fs.writeFileSync(filepath, JSON.stringify(results, null, 2), 'utf-8');
            console.log(`\n💾 Test results saved in ${filename}`);

        } catch (error) {
            console.error('❌ Error in test:', error);
        } finally {
            await this.close();
        }
    }
}

// Run the test
(async () => {
    console.log('🎯 Starting test crawler for specific links...');
    const testCrawler = new TestCrawler();
    await testCrawler.testLinks();
    console.log('\n🏁 Test completed!');
})(); 