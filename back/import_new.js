const fs = require('fs');
const path = require('path');
const axios = require('axios');

const Sequelize = require('sequelize');
const sequelize = require('./configs/database');
const DataTypes = Sequelize.DataTypes;

const City = require('./models/city')(sequelize, DataTypes);
const Neighborhood = require('./models/neighborhood')(sequelize, DataTypes);
const Property = require('./models/property')(sequelize, DataTypes);
const SaleDetail = require('./models/saleDetail')(sequelize, DataTypes);
const RentDetail = require('./models/rentDetail')(sequelize, DataTypes);

function parseLocation(location) {
    try {
        const parts = location.split(" در ");
        if (parts.length < 2) return { city: "", neighborhood: "", street: "" };
        const locParts = parts[1].split("،").map(p => p.trim());
        return {
            city: locParts[0] || "",
            neighborhood: locParts[1] || "",
            street: locParts[2] || "",
        };
    } catch {
        return { city: "", neighborhood: "", street: "" };
    }
}

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

async function downloadAllImages(imageLinks, propertyId) {
    const folderName = `property_${propertyId}`;
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
            localPaths.push(`public/images/${folderName}/${filename}`);
            console.log(`✅ Image saved: ${filename}`);
        } catch (error) {
            console.error(`❌ Error downloading image ${url}:`, error.message);
        }
    }

    return localPaths;
}

(async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established.');
        await sequelize.sync({ alter: true });

        const dataFolder = path.join(__dirname, 'jsondata');
        const files = fs.readdirSync(dataFolder);

        for (const file of files) {
            if (!file.endsWith('.json')) continue;

            console.log(`⏳ Reading file: ${file}`);

            const rawData = fs.readFileSync(path.join(dataFolder, file), 'utf-8');
            const ads = JSON.parse(rawData);

            for (const ad of ads) {
                const { city, neighborhood, street } = parseLocation(ad.location || "");

                let cityRecord = await City.findOne({ where: { name: city } });
                if (!cityRecord && city) {
                    cityRecord = await City.create({ name: city });
                }

                let neighborhoodRecord = null;
                if (neighborhood && cityRecord) {
                    neighborhoodRecord = await Neighborhood.findOne({ where: { name: neighborhood, cityId: cityRecord.id } });
                    if (!neighborhoodRecord) {
                        neighborhoodRecord = await Neighborhood.create({ name: neighborhood, cityId: cityRecord.id });
                    }
                }

                const { location, imageLinks = [], ...restAd } = ad;

                // تشخیص نوع آگهی (فروش یا رهن/اجاره)
                const isSale = !!(restAd.gheymatKol || restAd.gheymatHarMetr);
                const isRent = !!(restAd.vadie || restAd.ejare);
                const adType = isRent && !isSale ? 'rent' : 'sale';

                // تفکیک عکس‌ها
                let coverImage = null;
                let locationImage = null;
                const localImageLinks = [];
                for (const url of imageLinks) {
                    if (url.includes('api.divar.ir/v8/mapimage')) {
                        locationImage = url;
                    } else {
                        if (!coverImage) {
                            coverImage = url;
                        } else {
                            localImageLinks.push(url);
                        }
                    }
                }

                // دانلود عکس کاور و لوکال
                let coverImageLocal = null;
                let localImages = [];
                if (coverImage) {
                    const coverPaths = await downloadAllImages([coverImage], `cover_${Date.now()}`);
                    coverImageLocal = coverPaths[0] || null;
                }
                if (localImageLinks.length > 0) {
                    localImages = await downloadAllImages(localImageLinks, `property_${Date.now()}`);
                }

                // ساخت Property
                const property = await Property.create({
                    title: restAd.title,
                    metraj: restAd.metraj,
                    cityId: cityRecord ? cityRecord.id : null,
                    neighborhoodId: neighborhoodRecord ? neighborhoodRecord.id : null,
                    location: street,
                    type: adType,
                    coverImage: coverImageLocal,
                    locationImage: locationImage,
                });

                // درج جزئیات فروش یا اجاره
                if (adType === 'sale') {
                    await SaleDetail.create({
                        propertyId: property.id,
                        buildYear: restAd.salSakht,
                        rooms: restAd.otagh,
                        totalPrice: restAd.gheymatKol,
                        pricePerMeter: restAd.gheymatHarMetr,
                        elevator: restAd.asansor === 'دارد',
                        parking: restAd.parking === 'دارد',
                        storage: restAd.anbari === 'دارد',
                        description: restAd.tozihat,
                        imageLinks: imageLinks,
                        localImages: localImages,
                    });
                } else if (adType === 'rent') {
                    await RentDetail.create({
                        propertyId: property.id,
                        buildYear: restAd.salSakht,
                        rooms: restAd.otagh,
                        deposit: restAd.vadie,
                        rent: restAd.ejare,
                        elevator: restAd.asansor === 'دارد',
                        parking: restAd.parking === 'دارد',
                        storage: restAd.anbari === 'دارد',
                        description: restAd.tozihat,
                        imageLinks: imageLinks,
                        localImages: localImages,
                    });
                }

                console.log(`🟢 ${adType === 'rent' ? 'Rent' : 'Sale'} ad "${property.title}" added successfully.`);
            }
        }

        console.log('🎉 All ads imported successfully.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error importing:', err);
        process.exit(1);
    }
})();