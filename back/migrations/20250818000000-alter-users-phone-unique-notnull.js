'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1) Normalize existing phone numbers to +98 format when starting with 0 and 11 digits
    // Example: 09123456789 -> +989123456789
    try {
      await queryInterface.sequelize.query(
        "UPDATE \"Users\" SET phone = '+98' || SUBSTRING(phone FROM 2) WHERE phone ~ '^0\\d{10}$'"
      );
    } catch (e) {
      // Ignore if table not yet created
    }

    // 2) Add unique constraint on phone (if not already exists)
    try {
      await queryInterface.addConstraint('Users', {
        fields: ['phone'],
        type: 'unique',
        name: 'Users_phone_unique'
      });
    } catch (e) {
      // Constraint may already exist; ignore
    }

    // 3) Make phone NOT NULL
    try {
      await queryInterface.changeColumn('Users', 'phone', {
        type: Sequelize.STRING,
        allowNull: false
      });
    } catch (e) {
      // Column may already be NOT NULL or table not present yet; ignore
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Revert NOT NULL
    try {
      await queryInterface.changeColumn('Users', 'phone', {
        type: Sequelize.STRING,
        allowNull: true
      });
    } catch (e) {
      // ignore
    }

    // Drop unique constraint
    try {
      await queryInterface.removeConstraint('Users', 'Users_phone_unique');
    } catch (e) {
      // ignore
    }
  }
};


