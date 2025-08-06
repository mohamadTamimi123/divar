const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { extractAllNumbers, parseTabaghe } = require('./persian_number_utils');

class SaleTestCrawler {
    constructor() {
        this.browser = null;
        this.page = null;
    }

    async init() {
        console.log('🚀 Launching browser for sale property testing...');
        
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

    async extractSaleAdDetails(link) {
        try {
            console.log(`🔍 Testing sale link: ${link}`);
            
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

                // Extract price information for sale ads
                let priceData = {};
                
                // Check if this is a sale ad
                const isSaleAd = window.location.href.includes('sale') || 
                                window.location.href.includes('فروش') || 
                                document.querySelector('h1')?.innerText?.includes('فروش') ||
                                !window.location.href.includes('rent') && !window.location.href.includes('اجاره');

                if (isSaleAd) {
                    // Sale ad - extract sale-specific price information
                    priceData = {
                        gheymatKol: getRowValue('قیمت کل'),
                        gheymatHarMetr: getRowValue('قیمت هر متر'),
                        ghabeleTabdil: false
                    };
                } else {
                    // Fallback to rent ad logic if needed
                    const convertTable = document.querySelector('.convert-slider table.kt-group-row');
                    const ghabeleTabdil = !!convertTable;
                    
                    if (convertTable) {
                        const rows = convertTable.querySelectorAll('tbody tr td');
                        const vadie = rows[0]?.innerText.trim() || null;
                        const ejare = rows[1]?.innerText.trim() || null;
                        
                        priceData = { 
                            vadie: vadie, 
                            ejare: ejare, 
                            ghabeleTabdil 
                        };
                    } else {
                        const vadie = getRowValue('ودیعه');
                        const ejare = getRowValue('اجارهٔ ماهانه');
                        
                        priceData = { 
                            vadie: vadie, 
                            ejare: ejare, 
                            ghabeleTabdil: false
                        };
                    }
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
                    adType: isSaleAd ? 'sale' : 'rent'
                };
            });

            await detailPage.close();
            
            // Extract numeric values using our Persian number extractor
            const enhancedData = extractAllNumbers(data);
            
            return enhancedData;
        } catch (error) {
            console.error(`❌ Error extracting sale ad details:`, error.message);
            return null;
        }
    }

    async testSaleLinks() {
        try {
            await this.init();
            
            const saleTestLinks = [
                'https://divar.ir/v/%D8%A2%D9%BE%D8%A7%D8%B1%D8%AA%D9%85%D8%A7%D9%86-%D8%AE%D9%88%D8%A8-%D9%85%D9%86%D8%A7%D8%B3%D8%A8-%D8%B3%D8%B1%D9%85%D8%A7%DB%8C%D9%87-%DA%AF%D8%B0%D8%A7%D8%B1%DB%8C-%DA%AF%D9%84%D8%B4%D9%87%D8%B1/AaGKwri7'
            ];

            const results = [];
            
            for (const link of saleTestLinks) {
                console.log(`\n🔍 Testing sale property: ${link}`);
                const data = await this.extractSaleAdDetails(link);
                if (data) {
                    results.push(data);
                    console.log('✅ Successfully extracted sale data:');
                    console.log(`   Title: ${data.title}`);
                    console.log(`   Metraj: ${data.metraj} -> ${data.metrajInt}`);
                    console.log(`   Gheymat Kol: ${data.gheymatKol} -> ${data.gheymatKolInt}`);
                    console.log(`   Gheymat Har Metr: ${data.gheymatHarMetr} -> ${data.gheymatHarMetrInt}`);
                    console.log(`   Sal Sakht: ${data.salSakht} -> ${data.salSakhtInt}`);
                    console.log(`   Otagh: ${data.otagh} -> ${data.otaghInt}`);
                    console.log(`   Tabaghe: ${data.tabaghe} -> ${data.tabagheInt}`);
                    // نمایش طبقه به صورت current و total
                    const tabagheParsed = parseTabaghe(data.tabaghe);
                    console.log(`   Tabaghe (parsed): current=${tabagheParsed.current}, total=${tabagheParsed.total}`);
                    console.log(`   Location: ${data.location}`);
                    console.log(`   Ad Type: ${data.adType}`);
                } else {
                    console.log('❌ Failed to extract sale data');
                }
            }

            // Save results
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const outputDir = path.join(__dirname, 'output');
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            const filename = `test_sale_links_${timestamp}.json`;
            const filepath = path.join(outputDir, filename);
            
            fs.writeFileSync(filepath, JSON.stringify(results, null, 2), 'utf-8');
            console.log(`\n💾 Sale test results saved in ${filename}`);

            // Show summary statistics for sale properties
            if (results.length > 0) {
                console.log('\n📈 Sale Property Summary Statistics:');
                console.log('====================================');
                
                const gheymatKolValues = results.map(item => item.gheymatKolInt).filter(val => val !== null);
                const gheymatHarMetrValues = results.map(item => item.gheymatHarMetrInt).filter(val => val !== null);
                const metrajValues = results.map(item => item.metrajInt).filter(val => val !== null);

                if (gheymatKolValues.length > 0) {
                    const avgGheymatKol = Math.round(gheymatKolValues.reduce((a, b) => a + b, 0) / gheymatKolValues.length);
                    const minGheymatKol = Math.min(...gheymatKolValues);
                    const maxGheymatKol = Math.max(...gheymatKolValues);
                    console.log(`💰 Gheymat Kol - Avg: ${avgGheymatKol.toLocaleString()}, Min: ${minGheymatKol.toLocaleString()}, Max: ${maxGheymatKol.toLocaleString()}`);
                }

                if (gheymatHarMetrValues.length > 0) {
                    const avgGheymatHarMetr = Math.round(gheymatHarMetrValues.reduce((a, b) => a + b, 0) / gheymatHarMetrValues.length);
                    const minGheymatHarMetr = Math.min(...gheymatHarMetrValues);
                    const maxGheymatHarMetr = Math.max(...gheymatHarMetrValues);
                    console.log(`📐 Gheymat Har Metr - Avg: ${avgGheymatHarMetr.toLocaleString()}, Min: ${minGheymatHarMetr.toLocaleString()}, Max: ${maxGheymatHarMetr.toLocaleString()}`);
                }

                if (metrajValues.length > 0) {
                    const avgMetraj = Math.round(metrajValues.reduce((a, b) => a + b, 0) / metrajValues.length);
                    const minMetraj = Math.min(...metrajValues);
                    const maxMetraj = Math.max(...metrajValues);
                    console.log(`📏 Metraj - Avg: ${avgMetraj}, Min: ${minMetraj}, Max: ${maxMetraj}`);
                }
            }

        } catch (error) {
            console.error('❌ Error in sale test:', error);
        } finally {
            await this.close();
        }
    }
}

// Run the sale test
(async () => {
    console.log('🎯 Starting sale property test crawler...');
    const saleTestCrawler = new SaleTestCrawler();
    await saleTestCrawler.testSaleLinks();
    console.log('\n🏁 Sale test completed!');
})(); 