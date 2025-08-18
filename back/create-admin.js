const bcrypt = require('bcryptjs');
const { User } = require('./models');

async function createDefaultAdmin() {
    try {
        console.log('🔍 Checking for existing admin user...');
        
        // Check if admin user already exists
        const existingAdmin = await User.findOne({
            where: { email: 'admin@divar.com' }
        });

        if (existingAdmin) {
            console.log('ℹ️ Default admin user already exists');
            console.log('   Email: admin@divar.com');
            console.log('   Password: admin123');
            console.log('   Role:', existingAdmin.role);
            return;
        }

        console.log('📝 Creating default admin user...');
        
        // Hash the password
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Create default admin user
        const adminUser = await User.create({
            name: 'مدیر سیستم',
            email: 'admin@divar.com',
            password: hashedPassword,
            phone: '+989123456789',
            role: 'super_admin',
            isActive: true
        });

        console.log('✅ Default admin user created successfully!');
        console.log('');
        console.log('📋 Login Credentials:');
        console.log('   🌐 URL: http://localhost:5001/admin/login.html');
        console.log('   📧 Email: admin@divar.com');
        console.log('   🔑 Password: admin123');
        console.log('   👤 Role: super_admin');
        console.log('');
        console.log('🔒 Please change the default password after first login!');

    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        process.exit(1);
    }
}

// Run if this file is executed directly
if (require.main === module) {
    createDefaultAdmin()
        .then(() => {
            console.log('✨ Process completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 Process failed:', error);
            process.exit(1);
        });
}

module.exports = { createDefaultAdmin };