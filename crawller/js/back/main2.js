const puppeteer = require('puppeteer-core');

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        executablePath: '/usr/bin/google-chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
    );

    const url = 'https://divar.ir/s/karaj/buy-apartment';
    await page.goto(url, { waitUntil: 'networkidle2' });

    // بستن نقشه
    try {
        await page.click(
            '.kt-fab-button.kt-fab-button--medium.kt-fab-button--extended.kt-fab-button--raised'
        );
    } catch (e) {
        console.log('نقشه قبلاً بسته شده یا پیدا نشد.');
    }

    // استخراج 10 آگهی اول
    const posts = await page.evaluate(() => {
        const cards = document.querySelectorAll('div.kt-post-card__body');
        return Array.from(cards)
            .slice(0, 10)
            .map(card => ({
                title: card.querySelector('h2')?.innerText || '',
                link: card.closest('a')?.href || '',
            }));
    });

    console.log('📄 آگهی‌های اولیه:', posts.length);

    const details = [];
    let index = 1;

    for (const post of posts) {
        try {
            const detailPage = await browser.newPage();
            await detailPage.goto(post.link, { waitUntil: 'domcontentloaded', timeout: 20000 });

            // صبر برای لود اطلاعات
            await new Promise(r => setTimeout(r, 4000));
            const data = await detailPage.evaluate(async () => {
                // اسکرول به پایین برای بارگذاری کامل توضیحات
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

                const values = document.querySelectorAll('td.kt-group-row-item--info-row');

                const getRowValue = (label) => {
                    const rows = document.querySelectorAll('.kt-base-row');
                    for (const row of rows) {
                        const title = row.querySelector('.kt-base-row__title')?.innerText?.trim();
                        const value = row.querySelector('.kt-unexpandable-row__value')?.innerText?.trim();
                        if (title === label) return value;
                    }
                    return null;
                };

                const values2 = document.querySelectorAll('.kt-group-row-item.kt-group-row-item__value.kt-body.kt-body--stable');

                const descriptionEl = document.querySelector('.kt-description-row__text.kt-description-row__text--primary');
                console.log(descriptionEl)
                return {
                    title: document.querySelector('h1')?.innerText || '',
                    metraj: values[0]?.innerText.trim() || null,
                    salSakht: values[1]?.innerText.trim() || null,
                    otagh: values[2]?.innerText.trim() || null,
                    gheymatKol: getRowValue('قیمت کل'),
                    gheymatHarMetr: getRowValue('قیمت هر متر'),
                    tabaghe: getRowValue('طبقه'),
                    parking: values2[0]?.innerText.trim() || null,
                    asansor: values2[1]?.innerText.trim() || null,
                    anbari: values2[2]?.innerText.trim() || null,
                    tozihat: descriptionEl?.innerText?.trim() || null,
                    // tozihatHTML: descriptionEl,
                };
            });

            console.log(`✅ ${index}:`, data);
            details.push(data);
            await detailPage.close();
        } catch (err) {
            console.log(`⚠️ ${index}: اطلاعات دریافت نشد.\n❌ خطا در ${post.link}: ${err.message}`);
        }
        index++;
    }

    await browser.close();

    console.log('🏁 تمام آگهی‌ها:', details);
})();
