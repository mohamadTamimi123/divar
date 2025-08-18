'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Properties', 'adLink', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'لینک اصلی آگهی در دیوار یا سایر سایت‌ها'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Properties', 'adLink');
  }
};
