const fs = require('fs');
const path = require('path');
const axios = require('axios');
const sequelize = require('./configs/database');
const RentAd = require('./models/rentad'); // مدل آگهی اجاره

// تابع دانلود تکی عکس
async function downloadImage(url, filepath) {
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
    });

    return new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(filepath);
        response.data.pipe(writer);
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

// دانلود و ذخیره تمام عکس‌های یک آگهی
async function downloadAllImages(imageLinks, adId) {
    const folderName = `rentad_${adId}`;
    const folderPath = path.join('public/images', folderName);

    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    const localPaths = [];

    for (let i = 0; i < imageLinks.length; i++) {
        const url = imageLinks[i];
        const ext = path.extname(new URL(url).pathname).split('?')[0] || '.jpg';
        const filename = `img_${i + 1}${ext}`;
        const filepath = path.join(folderPath, filename);

        try {
            await downloadImage(url, filepath);
            localPaths.push(`public/images/${folderName}/${filename}`); // مسیر نسبی برای ذخیره در دیتابیس
            console.log(`✅ Image saved: ${filename}`);
        } catch (error) {
            console.error(`❌ Error downloading image ${url}:`, error.message);
        }
    }

    return localPaths;
}

// اجرای عملیات ایمپورت
(async () => {
    try {
        const rawData = fs.readFileSync('./rentdata.json', 'utf-8');
        const rentAds = JSON.parse(rawData);

        await sequelize.authenticate();
        console.log('✅ Database connection established.');
        await sequelize.sync({ alter: true });

        for (const ad of rentAds) {
            const {
                title,
                metraj,
                salSakht,
                otagh,
                vadie,
                ejare,
                tabaghe,
                gheymatKol,
                gheymatHarMetr,
                asansor,
                parking,
                anbari,
                tozihat,
                location,
                ghabeleTabdil,
                imageLinks = []
            } = ad;

            // ایجاد رکورد اولیه (بدون localImages)
            const createdAd = await RentAd.create({
                title,
                metraj,
                salSakht,
                otagh,
                vadie,
                ejare,
                tabaghe,
                gheymatKol,
                gheymatHarMetr,
                asansor,
                parking,
                anbari,
                tozihat,
                location,
                ghabeleTabdil,
                imageLinks,
                localImages: [],
            });

            // دانلود تصاویر و آپدیت localImages
            const localPaths = await downloadAllImages(imageLinks, createdAd.id);
            createdAd.localImages = localPaths;
            await createdAd.save();
        }

        console.log(`🎉 ${rentAds.length} rent ads imported successfully.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Error importing rent ads:', err.message);
        process.exit(1);
    }
})();
