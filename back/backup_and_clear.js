const sequelize = require('./configs/database');
const DataTypes = sequelize.Sequelize.DataTypes;

// Import models
const Property = require('./models/property')(sequelize, DataTypes);
const City = require('./models/city')(sequelize, DataTypes);
const Neighborhood = require('./models/neighborhood')(sequelize, DataTypes);
const SaleDetail = require('./models/saleDetail')(sequelize, DataTypes);
const RentDetail = require('./models/rentDetail')(sequelize, DataTypes);

// Set up associations
Property.belongsTo(City, { foreignKey: 'cityId', as: 'city' });
Property.belongsTo(Neighborhood, { foreignKey: 'neighborhoodId', as: 'neighborhood' });
Property.hasOne(SaleDetail, { foreignKey: 'propertyId', as: 'saleDetail' });
Property.hasOne(RentDetail, { foreignKey: 'propertyId', as: 'rentDetail' });

const fs = require('fs');
const path = require('path');

(async () => {
    try {
        console.log('🔌 Connecting to database...');
        await sequelize.authenticate();
        console.log('✅ Database connection established.');

        // Get all properties with their related data
        console.log('📊 Fetching all properties for backup...');
        const properties = await Property.findAll({
            include: [
                {
                    model: City,
                    as: 'city',
                    attributes: ['id', 'name']
                },
                {
                    model: Neighborhood,
                    as: 'neighborhood',
                    attributes: ['id', 'name']
                },
                {
                    model: SaleDetail,
                    as: 'saleDetail',
                    attributes: ['id', 'totalPrice', 'pricePerMeter', 'rooms', 'buildYear', 'elevator', 'parking', 'storage', 'description', 'imageLinks', 'localImages']
                },
                {
                    model: RentDetail,
                    as: 'rentDetail',
                    attributes: ['id', 'deposit', 'rent', 'rooms', 'buildYear', 'elevator', 'parking', 'storage', 'description', 'imageLinks', 'localImages']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        console.log(`📋 Found ${properties.length} properties`);

        if (properties.length === 0) {
            console.log('ℹ️ No properties found to backup or clear.');
            process.exit(0);
        }

        // Create backup data structure
        const backupData = {
            timestamp: new Date().toISOString(),
            totalProperties: properties.length,
            properties: properties.map(property => {
                const propertyData = {
                    id: property.id,
                    title: property.title,
                    type: property.type,
                    metraj: property.metraj,
                    description: property.description,
                    coverImage: property.coverImage,
                    images: property.images,
                    location: property.location,
                    url: property.url,
                    createdAt: property.createdAt,
                    updatedAt: property.updatedAt,
                    city: property.city ? {
                        id: property.city.id,
                        name: property.city.name
                    } : null,
                    neighborhood: property.neighborhood ? {
                        id: property.neighborhood.id,
                        name: property.neighborhood.name
                    } : null,
                    saleDetail: property.saleDetail ? {
                        id: property.saleDetail.id,
                        totalPrice: property.saleDetail.totalPrice,
                        pricePerMeter: property.saleDetail.pricePerMeter,
                        rooms: property.saleDetail.rooms,
                        buildYear: property.saleDetail.buildYear,
                        elevator: property.saleDetail.elevator,
                        parking: property.saleDetail.parking,
                        storage: property.saleDetail.storage,
                        description: property.saleDetail.description,
                        imageLinks: property.saleDetail.imageLinks,
                        localImages: property.saleDetail.localImages
                    } : null,
                    rentDetail: property.rentDetail ? {
                        id: property.rentDetail.id,
                        deposit: property.rentDetail.deposit,
                        rent: property.rentDetail.rent,
                        rooms: property.rentDetail.rooms,
                        buildYear: property.rentDetail.buildYear,
                        elevator: property.rentDetail.elevator,
                        parking: property.rentDetail.parking,
                        storage: property.rentDetail.storage,
                        description: property.rentDetail.description,
                        imageLinks: property.rentDetail.imageLinks,
                        localImages: property.rentDetail.localImages
                    } : null
                };
                return propertyData;
            })
        };

        // Create backup directory if it doesn't exist
        const backupDir = path.join(__dirname, 'backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
            console.log('📁 Created backups directory');
        }

        // Generate backup filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFilename = `properties_backup_${timestamp}.json`;
        const backupPath = path.join(backupDir, backupFilename);

        // Save backup to file
        fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf-8');
        
        console.log(`✅ Backup completed successfully!`);
        console.log(`📄 Backup file: ${backupPath}`);
        console.log(`📊 Total properties backed up: ${properties.length}`);
        
        // Show summary before clearing
        const saleCount = properties.filter(p => p.type === 'sale').length;
        const rentCount = properties.filter(p => p.type === 'rent').length;
        
        console.log(`\n📈 Summary before clearing:`);
        console.log(`💰 Sale properties: ${saleCount}`);
        console.log(`🏠 Rent properties: ${rentCount}`);
        
        // Show cities summary
        const cities = [...new Set(properties.map(p => p.city?.name).filter(Boolean))];
        console.log(`🏙️ Cities: ${cities.join(', ')}`);

        // Ask for confirmation before clearing
        console.log('\n⚠️  WARNING: About to clear all properties from database!');
        console.log('📄 Backup has been saved to:', backupPath);
        
        // Clear all properties
        console.log('\n🗑️  Clearing all properties from database...');
        
        // First delete related records (SaleDetail and RentDetail)
        console.log('🗑️  Deleting sale details...');
        await SaleDetail.destroy({ where: {} });
        
        console.log('🗑️  Deleting rent details...');
        await RentDetail.destroy({ where: {} });
        
        // Then delete properties
        console.log('🗑️  Deleting properties...');
        const deletedCount = await Property.destroy({ where: {} });
        
        console.log(`✅ Successfully cleared ${deletedCount} properties from database!`);
        console.log(`📄 Backup saved to: ${backupPath}`);
        
        // Verify clearing
        const remainingProperties = await Property.count();
        console.log(`\n🔍 Verification: ${remainingProperties} properties remaining in database`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Operation failed:', error.message);
        process.exit(1);
    }
})(); 