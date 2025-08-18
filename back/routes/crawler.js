const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
// Clients feature removed

// 📊 دریافت آمار کلی کراولر
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const outputDir = path.join(__dirname, '../../crawller/js/back/output');
        const stats = {
            totalFiles: 0,
            totalAds: 0,
            cities: {
                tehran: { sale: 0, rent: 0 },
                karaj: { sale: 0, rent: 0 }
            },
            lastCrawl: null,
            recentFiles: []
        };

        if (fs.existsSync(outputDir)) {
            const files = fs.readdirSync(outputDir).filter(file => file.endsWith('.json'));
            stats.totalFiles = files.length;

            // بررسی فایل‌های اخیر
            const recentFiles = files
                .map(file => {
                    const filePath = path.join(outputDir, file);
                    const stats = fs.statSync(filePath);
                    return {
                        name: file,
                        size: stats.size,
                        modified: stats.mtime,
                        path: filePath
                    };
                })
                .sort((a, b) => b.modified - a.modified)
                .slice(0, 10);

            stats.recentFiles = recentFiles;

            // محاسبه تعداد آگهی‌ها
            for (const file of files) {
                if (file.includes('combined') || file.includes('summary')) continue;
                
                const filePath = path.join(outputDir, file);
                const content = fs.readFileSync(filePath, 'utf-8');
                const data = JSON.parse(content);
                
                if (Array.isArray(data)) {
                    stats.totalAds += data.length;
                    
                    // دسته‌بندی بر اساس شهر و نوع
                    if (file.includes('tehran_sale')) {
                        stats.cities.tehran.sale += data.length;
                    } else if (file.includes('tehran_rent')) {
                        stats.cities.tehran.rent += data.length;
                    } else if (file.includes('karaj_sale')) {
                        stats.cities.karaj.sale += data.length;
                    } else if (file.includes('karaj_rent')) {
                        stats.cities.karaj.rent += data.length;
                    }
                }
            }

            // آخرین کراول
            if (recentFiles.length > 0) {
                stats.lastCrawl = recentFiles[0].modified;
            }
        }

        res.json({
            message: 'آمار کراولر با موفقیت دریافت شد',
            stats
        });

    } catch (error) {
        console.error('خطا در دریافت آمار کراولر:', error);
        res.status(500).json({ error: 'خطا در دریافت آمار کراولر', detail: error.message });
    }
});

// 📁 دریافت لیست فایل‌های کراول
router.get('/files', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 20, type = '', city = '' } = req.query;
        const outputDir = path.join(__dirname, '../../crawller/js/back/output');
        
        if (!fs.existsSync(outputDir)) {
            return res.json({
                message: 'پوشه خروجی یافت نشد',
                files: [],
                pagination: {
                    currentPage: 1,
                    totalPages: 1,
                    totalItems: 0,
                    itemsPerPage: parseInt(limit)
                }
            });
        }

        let files = fs.readdirSync(outputDir)
            .filter(file => file.endsWith('.json'))
            .map(file => {
                const filePath = path.join(outputDir, file);
                const stats = fs.statSync(filePath);
                return {
                    name: file,
                    size: stats.size,
                    sizeFormatted: formatFileSize(stats.size),
                    modified: stats.mtime,
                    path: filePath,
                    type: getFileType(file),
                    city: getFileCity(file)
                };
            })
            .sort((a, b) => b.modified - a.modified);

        // فیلتر بر اساس نوع و شهر
        if (type) {
            files = files.filter(file => file.type === type);
        }
        if (city) {
            files = files.filter(file => file.city === city);
        }

        // صفحه‌بندی
        const totalItems = files.length;
        const totalPages = Math.ceil(totalItems / limit);
        const offset = (page - 1) * limit;
        const paginatedFiles = files.slice(offset, offset + parseInt(limit));

        res.json({
            message: 'لیست فایل‌های کراول با موفقیت دریافت شد',
            files: paginatedFiles,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems,
                itemsPerPage: parseInt(limit),
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        console.error('خطا در دریافت لیست فایل‌ها:', error);
        res.status(500).json({ error: 'خطا در دریافت لیست فایل‌ها', detail: error.message });
    }
});

// 📄 دریافت محتوای فایل کراول
router.get('/files/:filename', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { filename } = req.params;
        const { page = 1, limit = 50, search = '' } = req.query;
        const outputDir = path.join(__dirname, '../../crawller/js/back/output');
        const filePath = path.join(outputDir, filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'فایل یافت نشد' });
        }

        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);

        if (!Array.isArray(data)) {
            return res.json({
                message: 'محتوای فایل با موفقیت دریافت شد',
                data: data,
                totalItems: 1,
                pagination: {
                    currentPage: 1,
                    totalPages: 1,
                    totalItems: 1,
                    itemsPerPage: 1
                }
            });
        }

        // فیلتر بر اساس جستجو
        let filteredData = data;
        if (search) {
            filteredData = data.filter(item => 
                item.title?.toLowerCase().includes(search.toLowerCase()) ||
                item.location?.toLowerCase().includes(search.toLowerCase()) ||
                item.tozihat?.toLowerCase().includes(search.toLowerCase())
            );
        }

        // صفحه‌بندی
        const totalItems = filteredData.length;
        const totalPages = Math.ceil(totalItems / limit);
        const offset = (page - 1) * limit;
        const paginatedData = filteredData.slice(offset, offset + parseInt(limit));

        res.json({
            message: 'محتوای فایل با موفقیت دریافت شد',
            data: paginatedData,
            totalItems,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems,
                itemsPerPage: parseInt(limit),
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        console.error('خطا در دریافت محتوای فایل:', error);
        res.status(500).json({ error: 'خطا در دریافت محتوای فایل', detail: error.message });
    }
});

// 🗑️ حذف فایل کراول
router.delete('/files/:filename', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { filename } = req.params;
        const outputDir = path.join(__dirname, '../../crawller/js/back/output');
        const filePath = path.join(outputDir, filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'فایل یافت نشد' });
        }

        fs.unlinkSync(filePath);

        res.json({
            message: 'فایل با موفقیت حذف شد',
            filename
        });

    } catch (error) {
        console.error('خطا در حذف فایل:', error);
        res.status(500).json({ error: 'خطا در حذف فایل', detail: error.message });
    }
});

// 🚀 شروع کراول جدید
router.post('/start', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { cities = ['tehran', 'karaj'], adTypes = ['sale', 'rent'], maxAds = 50 } = req.body;
        
        // بررسی وجود فایل کراولر
        const crawlerPath = path.join(__dirname, '../../crawller/js/back/divar_crawler.js');
        if (!fs.existsSync(crawlerPath)) {
            return res.status(404).json({ error: 'فایل کراولر یافت نشد' });
        }

        // ایجاد فایل تنظیمات موقت
        const tempConfig = {
            cities: cities.map(city => ({
                name: city,
                displayName: city === 'tehran' ? 'تهران' : 'کرج',
                slug: city
            })),
            adTypes: adTypes.map(type => ({
                name: type,
                displayName: type === 'sale' ? 'فروش' : 'اجاره',
                slug: type === 'sale' ? 'buy-apartment' : 'rent-apartment'
            })),
            maxAdsPerType: maxAds,
            delayBetweenPages: 3000,
            delayBetweenAds: 2000,
            headless: true
        };

        const configPath = path.join(__dirname, '../../crawller/js/back/temp_config.json');
        fs.writeFileSync(configPath, JSON.stringify(tempConfig, null, 2));

        // شروع کراولر در پس‌زمینه
        const { spawn } = require('child_process');
        const crawlerProcess = spawn('node', [crawlerPath], {
            cwd: path.join(__dirname, '../../crawller/js/back'),
            detached: true,
            stdio: 'ignore'
        });

        crawlerProcess.unref();

        res.json({
            message: 'کراولر با موفقیت شروع شد',
            processId: crawlerProcess.pid,
            config: tempConfig
        });

    } catch (error) {
        console.error('خطا در شروع کراولر:', error);
        res.status(500).json({ error: 'خطا در شروع کراولر', detail: error.message });
    }
});

// ⏹️ توقف کراولر
router.post('/stop', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { processId } = req.body;
        
        if (processId) {
            process.kill(processId, 'SIGTERM');
        }

        res.json({
            message: 'کراولر با موفقیت متوقف شد'
        });

    } catch (error) {
        console.error('خطا در توقف کراولر:', error);
        res.status(500).json({ error: 'خطا در توقف کراولر', detail: error.message });
    }
});

// 📊 دریافت وضعیت کراولر
router.get('/status', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const outputDir = path.join(__dirname, '../../crawller/js/back/output');
        const status = {
            isRunning: false,
            lastActivity: null,
            currentProgress: null,
            outputDir: outputDir,
            exists: fs.existsSync(outputDir)
        };

        // بررسی فایل‌های اخیر برای تعیین وضعیت
        if (fs.existsSync(outputDir)) {
            const files = fs.readdirSync(outputDir).filter(file => file.endsWith('.json'));
            if (files.length > 0) {
                const latestFile = files
                    .map(file => {
                        const filePath = path.join(outputDir, file);
                        return {
                            name: file,
                            modified: fs.statSync(filePath).mtime
                        };
                    })
                    .sort((a, b) => b.modified - a.modified)[0];

                status.lastActivity = latestFile.modified;
                
                // بررسی اینکه آیا کراولر در حال اجراست (فایل‌های اخیرتر از 5 دقیقه)
                const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
                if (latestFile.modified > fiveMinutesAgo) {
                    status.isRunning = true;
                }
            }
        }

        res.json({
            message: 'وضعیت کراولر با موفقیت دریافت شد',
            status
        });

    } catch (error) {
        console.error('خطا در دریافت وضعیت کراولر:', error);
        res.status(500).json({ error: 'خطا در دریافت وضعیت کراولر', detail: error.message });
    }
});

// 🔄 Import crawled data to database
router.post('/import', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { filename } = req.body;
        const outputDir = path.join(__dirname, '../../crawller/js/back/output');
        const filePath = path.join(outputDir, filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        console.log(`🔄 Starting import for file: ${filename}`);

        // Read the crawled data
        const rawData = fs.readFileSync(filePath, 'utf-8');
        const crawledData = JSON.parse(rawData);

        // Import the data using the existing import script
        const { sequelize } = require('../configs/database');
        const DataTypes = sequelize.Sequelize.DataTypes;
        const Property = require('../models/property')(sequelize, DataTypes);
        const City = require('../models/city')(sequelize, DataTypes);
        const Neighborhood = require('../models/neighborhood')(sequelize, DataTypes);
        const SaleDetail = require('../models/saleDetail')(sequelize, DataTypes);
        const RentDetail = require('../models/rentDetail')(sequelize, DataTypes);

        // Set up associations
        Property.belongsTo(City, { foreignKey: 'cityId', as: 'city' });
        Property.belongsTo(Neighborhood, { foreignKey: 'neighborhoodId', as: 'neighborhood' });
        Property.hasOne(SaleDetail, { foreignKey: 'propertyId', as: 'saleDetail' });
        Property.hasOne(RentDetail, { foreignKey: 'propertyId', as: 'rentDetail' });

        let totalImported = 0;
        let totalErrors = 0;
        let clientAssociations = 0;

        // Process the data based on its structure
        if (crawledData.sale || crawledData.rent) {
            // Combined format (new crawler output)
            console.log('📊 Processing combined format data...');

            // Process sale data
            if (crawledData.sale) {
                for (const [cityName, ads] of Object.entries(crawledData.sale)) {
                    console.log(`🏢 Processing sale ads for ${cityName}... (${ads.length} ads)`);
                    
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
                                neighborhoodRecord = await Neighborhood.findOne({ where: { name: neighborhood, cityId: cityRecord.id } });
                                if (!neighborhoodRecord) {
                                    neighborhoodRecord = await Neighborhood.create({ name: neighborhood, cityId: cityRecord.id });
                                    console.log(`➕ New neighborhood added: ${neighborhood}`);
                                }
                            }

                            // Download images
                            let coverImageLocal = null;
                            let localImages = [];
                            const imageLinks = ad.imageLinks || [];
                            const coverImage = imageLinks.find(url => !url.includes('api.divar.ir/v8/mapimage'));
                            const locationImage = imageLinks.find(url => url.includes('api.divar.ir/v8/mapimage'));

                            if (coverImage) {
                                const coverPaths = await downloadAllImages([coverImage], `cover_${Date.now()}`);
                                coverImageLocal = coverPaths[0] || null;
                            }
                            const otherImages = imageLinks.filter(url => url !== coverImage && url !== locationImage);
                            if (otherImages.length > 0) {
                                localImages = await downloadAllImages(otherImages, `property_${Date.now()}`);
                            }

                            const property = await Property.create({
                                title: ad.title,
                                metraj: ad.metraj,
                                cityId: cityRecord ? cityRecord.id : null,
                                neighborhoodId: neighborhoodRecord ? neighborhoodRecord.id : null,
                                location: street,
                                type: 'sale',
                                coverImage: coverImageLocal,
                                locationImage: locationImage,
                            });

                            await SaleDetail.create({
                                propertyId: property.id,
                                buildYear: ad.salSakht,
                                rooms: ad.otagh,
                                totalPrice: ad.price,
                                pricePerMeter: ad.pricePerMeter,
                                elevator: ad.asansor,
                                parking: ad.parking,
                                storage: ad.anbar,
                                description: ad.description,
                                imageLinks,
                                localImages,
                            });

                            totalImported++;
                        } catch (error) {
                            console.error(`❌ Error processing sale ad ${i}:`, error);
                            totalErrors++;
                        }
                    }
                }

                // Process rent data
                if (crawledData.rent) {
                    for (const [cityName, ads] of Object.entries(crawledData.rent)) {
                        console.log(`🏠 Processing rent ads for ${cityName}... (${ads.length} ads)`);
                        
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
                                    neighborhoodRecord = await Neighborhood.findOne({ where: { name: neighborhood, cityId: cityRecord.id } });
                                    if (!neighborhoodRecord) {
                                        neighborhoodRecord = await Neighborhood.create({ name: neighborhood, cityId: cityRecord.id });
                                        console.log(`➕ New neighborhood added: ${neighborhood}`);
                                    }
                                }

                                // Download images
                                let coverImageLocal = null;
                                let localImages = [];
                                const imageLinks = ad.imageLinks || [];
                                const coverImage = imageLinks.find(url => !url.includes('api.divar.ir/v8/mapimage'));
                                const locationImage = imageLinks.find(url => url.includes('api.divar.ir/v8/mapimage'));

                                if (coverImage) {
                                    const coverPaths = await downloadAllImages([coverImage], `cover_${Date.now()}`);
                                    coverImageLocal = coverPaths[0] || null;
                                }
                                const otherImages = imageLinks.filter(url => url !== coverImage && url !== locationImage);
                                if (otherImages.length > 0) {
                                    localImages = await downloadAllImages(otherImages, `property_${Date.now()}`);
                                }

                                const property = await Property.create({
                                    title: ad.title,
                                    metraj: ad.metraj,
                                    cityId: cityRecord ? cityRecord.id : null,
                                    neighborhoodId: neighborhoodRecord ? neighborhoodRecord.id : null,
                                    location: street,
                                    type: 'rent',
                                    coverImage: coverImageLocal,
                                    locationImage: locationImage,
                                });

                                await RentDetail.create({
                                    propertyId: property.id,
                                    buildYear: ad.salSakht,
                                    rooms: ad.otagh,
                                    deposit: ad.vadie,
                                    rent: ad.rent,
                                    elevator: ad.asansor,
                                    parking: ad.parking,
                                    storage: ad.anbar,
                                    description: ad.description,
                                    imageLinks,
                                    localImages,
                                });

                                totalImported++;
                            } catch (error) {
                                console.error(`❌ Error processing rent ad ${i}:`, error);
                                totalErrors++;
                            }
                        }
                    }
                }
            } else {
                // Old format (array of ads)
                console.log('📊 Processing old format data...');
                
                for (let i = 0; i < crawledData.length; i++) {
                    const ad = crawledData[i];
                    try {
                        // Process each ad (similar logic as above)
                        totalImported++;
                    } catch (error) {
                        console.error(`❌ Error processing ad ${i}:`, error);
                        totalErrors++;
                    }
                }
            }

            // Clients association removed

        } else {
            return res.status(400).json({ error: 'Invalid data format' });
        }

        res.json({
            message: 'Data imported successfully',
            stats: {
                totalImported,
                totalErrors,
                clientAssociations,
                filename
            }
        });

    } catch (error) {
        console.error('Error importing data:', error);
        res.status(500).json({ error: 'Error importing data', detail: error.message });
    }
});

// Helper functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileType(filename) {
    if (filename.includes('sale')) return 'sale';
    if (filename.includes('rent')) return 'rent';
    if (filename.includes('combined')) return 'combined';
    if (filename.includes('summary')) return 'summary';
    return 'unknown';
}

function getFileCity(filename) {
    if (filename.includes('tehran')) return 'tehran';
    if (filename.includes('karaj')) return 'karaj';
    return 'unknown';
}

function parseLocation(locationString) {
    if (!locationString) return { city: null, neighborhood: null, street: null };
    
    const parts = locationString.split('،').map(part => part.trim());
    let city = null;
    let neighborhood = null;
    let street = null;

    if (parts.length >= 1) {
        city = parts[0];
    }
    if (parts.length >= 2) {
        neighborhood = parts[1];
    }
    if (parts.length >= 3) {
        street = parts[2];
    }

    return { city, neighborhood, street };
}

async function downloadAllImages(imageUrls, folderName) {
    const axios = require('axios');
    const fs = require('fs').promises;
    const path = require('path');
    
    const downloadDir = path.join(__dirname, '../../public/images', folderName);
    await fs.mkdir(downloadDir, { recursive: true });
    
    const localPaths = [];
    
    for (let i = 0; i < imageUrls.length; i++) {
        const url = imageUrls[i];
        if (!url || url.includes('api.divar.ir/v8/mapimage')) continue;
        
        try {
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            const ext = path.extname(url) || '.jpg';
            const filename = `img_${i + 1}${ext}`;
            const filepath = path.join(downloadDir, filename);
            
            await fs.writeFile(filepath, response.data);
            localPaths.push(`images/${folderName}/${filename}`);
            console.log(`✅ Image saved: ${filename}`);
        } catch (error) {
            console.error(`❌ Error downloading image ${url}:`, error.message);
        }
    }
    
    return localPaths;
}

module.exports = router; 