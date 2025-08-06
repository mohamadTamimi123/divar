'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Payments', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      amount: {
        type: Sequelize.INTEGER, // مبلغ به تومان
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      gateway: {
        type: Sequelize.STRING,
        defaultValue: 'zarinpal',
      },
      authority: {
        type: Sequelize.STRING, // کد مرجع زرین‌پال
        allowNull: true,
      },
      refId: {
        type: Sequelize.STRING, // شماره پیگیری
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('pending', 'success', 'failed', 'cancelled'),
        defaultValue: 'pending',
      },
      gatewayResponse: {
        type: Sequelize.JSON, // پاسخ کامل درگاه
        allowNull: true,
      },
      callbackUrl: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      returnUrl: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      metadata: {
        type: Sequelize.JSON, // اطلاعات اضافی (مثل نوع اشتراک)
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
    await queryInterface.dropTable('Payments');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Payments_status";');
  }
}; 