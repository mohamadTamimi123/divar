// models/payment.js
module.exports = (sequelize, DataTypes) => {
    const Payment = sequelize.define('Payment', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id',
            },
        },
        amount: {
            type: DataTypes.INTEGER, // مبلغ به تومان
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        gateway: {
            type: DataTypes.STRING,
            defaultValue: 'zarinpal',
        },
        authority: {
            type: DataTypes.STRING, // کد مرجع زرین‌پال
            allowNull: true,
        },
        refId: {
            type: DataTypes.STRING, // شماره پیگیری
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('pending', 'success', 'failed', 'cancelled'),
            defaultValue: 'pending',
        },
        gatewayResponse: {
            type: DataTypes.JSON, // پاسخ کامل درگاه
            allowNull: true,
        },
        callbackUrl: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        returnUrl: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        metadata: {
            type: DataTypes.JSON, // اطلاعات اضافی (مثل نوع اشتراک)
            allowNull: true,
        },
    }, {
        tableName: 'Payments',
    });

    Payment.associate = (models) => {
        Payment.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    };

    return Payment;
}; 