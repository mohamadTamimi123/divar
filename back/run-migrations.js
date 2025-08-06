const sequelize = require('./configs/database');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
    try {
        console.log('🔄 Starting migrations...');

        // Read the migration file
        const migrationPath = path.join(__dirname, 'migrations', '20250108000000-create-client-files.js');
        
        if (!fs.existsSync(migrationPath)) {
            console.error('❌ Migration file not found:', migrationPath);
            return;
        }

        const migration = require(migrationPath);

        // Run the migration
        console.log('📦 Running ClientFile migration...');
        await migration.up(sequelize.getQueryInterface(), sequelize.Sequelize);
        
        console.log('✅ Migration completed successfully!');
        
        // Close the connection
        await sequelize.close();
        console.log('🔌 Database connection closed');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run the migration
runMigrations(); 