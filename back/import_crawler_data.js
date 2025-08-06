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
    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
            timeout: 10000, // 10 seconds timeout
        });
        return new Promise((resolve, reject) => {
            const writer = fs.createWriteStream(filepath);
            response.data.pipe(writer);
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (error) {
        throw error;
    }
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
        
        // Skip map images
        if (url.includes('api.divar.ir/v8/mapimage')) {
            continue;
        }
        
        const ext = path.extname(new URL(url).pathname).split('?')[0] || '.jpg';
        const filename = `img_${i + 1}${ext}`;
        const filepath = path.join(folderPath, filename);

        try {
            await downloadImage(url, filepath);
            localPaths.push(`images/${folderName}/${filename}`);
            console.log(`✅ Image saved: ${filename}`);
        } catch (error) {
            console.error(`❌ Error downloading image ${url}:`, error.message);
        }
    }

    return localPaths;
}

(async () => {
    try {
        console.log('🔌 Connecting to database...');
        await sequelize.authenticate();
        console.log('✅ Database connection established.');
        
        console.log('🔄 Synchronizing tables...');
        await sequelize.sync({ alter: true });
        console.log('✅ Tables ready.');

        // Use the latest combined data file
        const crawlerDataFile = path.join(__dirname, '..', 'crawller', 'js', 'back', 'output', 'divar_combined_2025-08-06T10-34-15-637Z.json');
        
        if (!fs.existsSync(crawlerDataFile)) {
            console.error('❌ Crawler data file not found:', crawlerDataFile);
            process.exit(1);
        }

        console.log(`⏳ Reading crawler data file...`);
        const rawData = fs.readFileSync(crawlerDataFile, 'utf-8');
        const crawlerData = JSON.parse(rawData);

        let totalImported = 0;
        let totalErrors = 0;

        // Process sale data
        if (crawlerData.sale) {
            for (const [cityName, ads] of Object.entries(crawlerData.sale)) {
                console.log(`\n🏢 Processing sale ads for ${cityName}... (${ads.length} ads)`);
                
                for (let i = 0; i < ads.length; i++) {
                    const ad = ads[i];
                    try {
                        const { city, neighborhood, street } = parseLocation(ad.location || "");

                        // Create/find city
                        let cityRecord = await City.findOne({ where: { name: city } });
                        if (!cityRecord && city) {
                            cityRecord = await City.create({ name: city });
                            console.log(`➕ New city added: ${city}`);
                        }

                        // Create/find neighborhood
                        let neighborhoodRecord = null;
                        if (neighborhood && cityRecord) {
                            neighborhoodRecord = await Neighborhood.findOne({ 
                                where: { name: neighborhood, cityId: cityRecord.id } 
                            });
                            if (!neighborhoodRecord) {
                                neighborhoodRecord = await Neighborhood.create({ 
                                    name: neighborhood, 
                                    cityId: cityRecord.id 
                                });
                                console.log(`➕ New neighborhood added: ${neighborhood}`);
                            }
                        }

                        // Process images
                        let coverImage = null;
                        let localImages = [];
                        
                        if (ad.imageLinks && ad.imageLinks.length > 0) {
                            // Find cover image (first non-map image)
                            const nonMapImages = ad.imageLinks.filter(url => !url.includes('api.divar.ir/v8/mapimage'));
                            if (nonMapImages.length > 0) {
                                coverImage = nonMapImages[0];
                                
                                // Download images
                                const propertyId = `${Date.now()}_${i}`;
                                localImages = await downloadAllImages(nonMapImages, propertyId);
                                if (localImages.length > 0) {
                                    coverImage = localImages[0];
                                }
                            }
                        }

                        // Create property with new numeric fields
                        const property = await Property.create({
                            title: ad.title,
                            metraj: ad.metrajInt ? ad.metrajInt.toString() : (ad.metraj ? ad.metraj : null),
                            cityId: cityRecord ? cityRecord.id : null,
                            neighborhoodId: neighborhoodRecord ? neighborhoodRecord.id : null,
                            location: street,
                            type: 'sale',
                            coverImage: coverImage,
                            neighborhood: neighborhood,
                        });

                        // Create sale details with new numeric fields
                        await SaleDetail.create({
                            propertyId: property.id,
                            buildYear: ad.salSakhtInt ? ad.salSakhtInt.toString() : (ad.salSakht ? ad.salSakht : null),
                            rooms: ad.otaghInt ? ad.otaghInt.toString() : (ad.otagh ? ad.otagh : null),
                            totalPrice: ad.gheymatKolInt ? ad.gheymatKolInt.toString() : (ad.gheymatKol ? ad.gheymatKol : null),
                            pricePerMeter: ad.gheymatHarMetrInt ? ad.gheymatHarMetrInt.toString() : (ad.gheymatHarMetr ? ad.gheymatHarMetr : null),
                            elevator: ad.asansor === 'آسانسور' || ad.asansor === 'دارد',
                            parking: ad.parking === 'پارکینگ' || ad.parking === 'دارد',
                            storage: ad.anbari === 'انباری' || ad.anbari === 'دارد',
                            description: ad.tozihat,
                            imageLinks: ad.imageLinks || [],
                            localImages: localImages,
                        });

                        totalImported++;
                        console.log(`🟢 Sale ad ${i + 1}/${ads.length} added: "${property.title}"`);
                        console.log(`   Metraj: ${ad.metrajInt || ad.metraj}, Price: ${ad.gheymatKolInt || ad.gheymatKol}, Floor: ${ad.tabagheCurrent || ad.tabaghe}`);
                    } catch (error) {
                        totalErrors++;
                        console.error(`❌ Error in sale ad ${i + 1}:`, error.message);
                    }
                }
            }
        }

        // Process rent data
        if (crawlerData.rent) {
            for (const [cityName, ads] of Object.entries(crawlerData.rent)) {
                console.log(`\n🏠 Processing rent ads for ${cityName}... (${ads.length} ads)`);
                
                for (let i = 0; i < ads.length; i++) {
                    const ad = ads[i];
                    try {
                        const { city, neighborhood, street } = parseLocation(ad.location || "");

                        // Create/find city
                        let cityRecord = await City.findOne({ where: { name: city } });
                        if (!cityRecord && city) {
                            cityRecord = await City.create({ name: city });
                            console.log(`➕ New city added: ${city}`);
                        }

                        // Create/find neighborhood
                        let neighborhoodRecord = null;
                        if (neighborhood && cityRecord) {
                            neighborhoodRecord = await Neighborhood.findOne({ 
                                where: { name: neighborhood, cityId: cityRecord.id } 
                            });
                            if (!neighborhoodRecord) {
                                neighborhoodRecord = await Neighborhood.create({ 
                                    name: neighborhood, 
                                    cityId: cityRecord.id 
                                });
                                console.log(`➕ New neighborhood added: ${neighborhood}`);
                            }
                        }

                        // Process images
                        let coverImage = null;
                        let localImages = [];
                        
                        if (ad.imageLinks && ad.imageLinks.length > 0) {
                            // Find cover image (first non-map image)
                            const nonMapImages = ad.imageLinks.filter(url => !url.includes('api.divar.ir/v8/mapimage'));
                            if (nonMapImages.length > 0) {
                                coverImage = nonMapImages[0];
                                
                                // Download images
                                const propertyId = `${Date.now()}_${i}_rent`;
                                localImages = await downloadAllImages(nonMapImages, propertyId);
                                if (localImages.length > 0) {
                                    coverImage = localImages[0];
                                }
                            }
                        }

                        // Create property with new numeric fields
                        const property = await Property.create({
                            title: ad.title,
                            metraj: ad.metrajInt ? ad.metrajInt.toString() : (ad.metraj ? ad.metraj : null),
                            cityId: cityRecord ? cityRecord.id : null,
                            neighborhoodId: neighborhoodRecord ? neighborhoodRecord.id : null,
                            location: street,
                            type: 'rent',
                            coverImage: coverImage,
                            neighborhood: neighborhood,
                        });

                        // Create rent details with new numeric fields
                        await RentDetail.create({
                            propertyId: property.id,
                            buildYear: ad.salSakhtInt ? ad.salSakhtInt.toString() : (ad.salSakht ? ad.salSakht : null),
                            rooms: ad.otaghInt ? ad.otaghInt.toString() : (ad.otagh ? ad.otagh : null),
                            deposit: ad.vadieInt ? ad.vadieInt.toString() : (ad.vadie ? ad.vadie : null),
                            rent: ad.ejareInt ? ad.ejareInt.toString() : (ad.ejare ? ad.ejare : null),
                            elevator: ad.asansor === 'آسانسور' || ad.asansor === 'دارد',
                            parking: ad.parking === 'پارکینگ' || ad.parking === 'دارد',
                            storage: ad.anbari === 'انباری' || ad.anbari === 'دارد',
                            description: ad.tozihat,
                            imageLinks: ad.imageLinks || [],
                            localImages: localImages,
                        });

                        totalImported++;
                        console.log(`🟢 Rent ad ${i + 1}/${ads.length} added: "${property.title}"`);
                        console.log(`   Metraj: ${ad.metrajInt || ad.metraj}, Deposit: ${ad.vadieInt || ad.vadie}, Rent: ${ad.ejareInt || ad.ejare}, Floor: ${ad.tabagheCurrent || ad.tabaghe}`);
                    } catch (error) {
                        totalErrors++;
                        console.error(`❌ Error in rent ad ${i + 1}:`, error.message);
                    }
                }
            }
        }

        console.log(`\n🎉 Import completed!`);
        console.log(`✅ ${totalImported} ads imported successfully`);
        console.log(`❌ ${totalErrors} errors occurred`);
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Import error:', err);
        process.exit(1);
    }
})();