'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('RentDetails', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      propertyId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Properties',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      buildYear: Sequelize.STRING,
      rooms: Sequelize.STRING,
      deposit: Sequelize.STRING,
      rent: Sequelize.STRING,
      elevator: Sequelize.BOOLEAN,
      parking: Sequelize.BOOLEAN,
      storage: Sequelize.BOOLEAN,
      description: Sequelize.TEXT,
      imageLinks: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
      },
      localImages: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
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
    await queryInterface.dropTable('RentDetails');
  }
};
