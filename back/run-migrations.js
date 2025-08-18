const sequelize = require('./configs/database');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
    try {
        console.log('🔄 Starting migrations...');

        console.log('No manual migration to run. Use sequelize-cli instead.');
        
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