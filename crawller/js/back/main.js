const puppeteer = require('puppeteer-core');
const fs = require('fs');

async function autoScrollUntilButton(page, timeout = 30000, scrollDelay = 1000) {
    let allPostsMap = new Map();
    const distance = 500;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        await page.evaluate(distance => window.scrollBy(0, distance), distance);
        await new Promise(r => setTimeout(r, scrollDelay));

        const currentPosts = await page.evaluate(() => {
            const cards = document.querySelectorAll('div.kt-post-card__body');
            return Array.from(cards).map(card => ({
                title: card.querySelector('h2')?.innerText || '',
                price: card.querySelector('div.kt-post-card__description')?.innerText || '',
                link: card.closest('a')?.href || '',
            }));
        });

        for (const post of currentPosts) {
            if (post.link) allPostsMap.set(post.link, post);
        }

        const buttonVisible = await page.evaluate(() => {
            const btn = document.querySelector('button.kt-button.kt-button--primary.kt-button--outlined.post-list__load-more-btn-be092');
            if (!btn) return false;
            const style = window.getComputedStyle(btn);
            const rect = btn.getBoundingClientRect();
            return style.display !== 'none' && style.visibility !== 'hidden' && rect.top >= 0 && rect.bottom <= window.innerHeight;
        });

        if (buttonVisible) {
            console.log('✅ Load more button found. Stopping scroll.');
            break;
        }
    }

    return Array.from(allPostsMap.values());
}

async function extractPostDetails(page, url) {
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        // صبر برای بارگذاری عناصر مهم
        await page.waitForSelector('.kt-page-title__title', { timeout: 10000 });
        await page.waitForTimeout(1000);

        return await page.evaluate(() => {
            const getText = selector => document.querySelector(selector)?.innerText || '';

            const extractFromDetails = (label) => {
                const items = Array.from(document.querySelectorAll('.kt-group-row-item__title'));
                for (let i = 0; i < items.length; i++) {
                    if (items[i].innerText.includes(label)) {
                        const valueNode = items[i].nextElementSibling;
                        return valueNode?.innerText || '';
                    }
                }
                return '';
            };

            return {
                title: getText('h1.kt-page-title__title'),
                price: getText('.kt-unexpandable-row__value'),
                description: getText('.kt-description-row__text'),
                metraj: extractFromDetails('متراژ'),
                saalSakht: extractFromDetails('سال ساخت'),
                otagh: extractFromDetails('اتاق'),
                asansor: extractFromDetails('آسانسور'),
                parking: extractFromDetails('پارکینگ'),
                anbaari: extractFromDetails('انباری'),
                location: getText('.kt-page-title__subtitle'),
                url: window.location.href
            };
        });
    } catch (err) {
        console.error('❌ خطا در استخراج از:', url);
        return null;
    }
}

(async () => {
    const url = 'https://divar.ir/s/karaj/buy-apartment';

    const browser = await puppeteer.launch({
        headless: false,
        executablePath: '/usr/bin/google-chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
    );

    await page.goto(url, { waitUntil: 'networkidle2' });

    try {
        await page.waitForSelector(
            '.kt-fab-button.kt-fab-button--medium.kt-fab-button--extended.kt-fab-button--raised',
            { timeout: 5000 }
        );
        await page.click(
            '.kt-fab-button.kt-fab-button--medium.kt-fab-button--extended.kt-fab-button--raised'
        );
        console.log('📍 Map closed.');
    } catch {
        console.log('ℹ️ Close map button not found or already closed.');
    }

    const posts = await autoScrollUntilButton(page, 60000, 1000);
    console.log(`🔍 Initial ads count: ${posts.length}`);

    const detailPage = await browser.newPage();
    const detailedPosts = [];

    for (const [i, post] of posts.entries()) {
        console.log(`📥 Ad ${i + 1}/${posts.length} - ${post.link}`);
        const data = await extractPostDetails(detailPage, post.link);
        if (data) {
            detailedPosts.push(data);
        } else {
            console.warn(`⚠️ اطلاعاتی برای ${post.link} دریافت نشد.`);
        }
        await new Promise(r => setTimeout(r, 1500)); // ⏱ تأخیر بین درخواست‌ها
    }

    fs.writeFileSync('results.json', JSON.stringify(detailedPosts, null, 2), 'utf-8');
    console.log('✅ Saved: results.json');

    // await browser.close(); // در صورت نیاز فعال کن
})();
