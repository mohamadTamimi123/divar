const fs = require('fs');
const path = require('path');
const axios = require('axios');
const sequelize = require('./configs/database');
const Ad = require('./models/ad');

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

async function downloadAllImages(imageLinks, adId) {
    const folderName = `ad_${adId}`;
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
            localPaths.push(filepath);
            console.log(`✅ Image saved: ${filename}`);
        } catch (error) {
            console.error(`❌ Error downloading image ${url}:`, error.message);
        }
    }

    return localPaths;
}

(async () => {
    try {
        const rawData = fs.readFileSync('./data.json', 'utf-8');
        const ads = JSON.parse(rawData);

        await sequelize.authenticate();
        console.log('✅ Database connection established.');
        await sequelize.sync({ alter: true });

        for (const ad of ads) {
            const imageLinks = ad.imageLinks || [];

            // ابتدا آگهی را بدون عکس ذخیره می‌کنیم
            const createdAd = await Ad.create({ ...ad, localImages: [] });

            // سپس عکس‌ها را دانلود می‌کنیم
            const localPaths = await downloadAllImages(imageLinks, createdAd.id);

            // حالا آگهی را به‌روزرسانی می‌کنیم
            createdAd.localImages = localPaths;
            await createdAd.save();
        }

        console.log(`🎉 ${ads.length} ads imported successfully.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Error importing:', err.message);
        process.exit(1);
    }
})();
