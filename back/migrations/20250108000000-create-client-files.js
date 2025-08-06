'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ClientFiles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      clientId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Clients',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      filename: {
        type: Sequelize.STRING,
        allowNull: false
      },
      filePath: {
        type: Sequelize.STRING,
        allowNull: false
      },
      fileType: {
        type: Sequelize.ENUM('property', 'crawled', 'generated'),
        defaultValue: 'property'
      },
      title: {
        type: Sequelize.STRING,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      isNew: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      matchScore: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    // Add indexes
    await queryInterface.addIndex('ClientFiles', ['clientId', 'userId']);
    await queryInterface.addIndex('ClientFiles', ['isNew']);
    await queryInterface.addIndex('ClientFiles', ['fileType']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ClientFiles');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_ClientFiles_fileType";');
  }
}; 