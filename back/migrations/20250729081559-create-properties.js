'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Properties', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      metraj: Sequelize.STRING,
      cityId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Cities',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      neighborhoodId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Neighborhoods',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      location: Sequelize.STRING,
      locationImage: {             // ← فیلد جدید
        type: Sequelize.STRING,
        allowNull: true,
      },
      coverImage: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      type: {
        type: Sequelize.ENUM('sale', 'rent', 'land', 'partnership'),
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Properties');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Properties_type";');
  }
};
