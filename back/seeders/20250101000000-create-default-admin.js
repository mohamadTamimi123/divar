'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if admin user already exists
    const existingAdmin = await queryInterface.sequelize.query(
      "SELECT * FROM \"Users\" WHERE email = 'admin@divar.com'",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (existingAdmin.length === 0) {
      // Hash the password
      const hashedPassword = await bcrypt.hash('admin123', 10);

      // Insert default admin user
      await queryInterface.bulkInsert('Users', [
        {
          name: 'مدیر سیستم',
          email: 'admin@divar.com',
          password: hashedPassword,
          phone: '+989123456789',
          role: 'super_admin',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);

      console.log('✅ Default admin user created:');
      console.log('   Email: admin@divar.com');
      console.log('   Password: admin123');
      console.log('   Role: super_admin');
    } else {
      console.log('ℹ️ Default admin user already exists');
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', {
      email: 'admin@divar.com'
    });
  }
};