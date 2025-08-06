// models/saleDetail.js
module.exports = (sequelize, DataTypes) => {
    const SaleDetail = sequelize.define('SaleDetail', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        propertyId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Properties',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        buildYear: DataTypes.STRING,
        rooms: DataTypes.STRING,
        totalPrice: DataTypes.STRING,
        pricePerMeter: DataTypes.STRING,
        elevator: DataTypes.BOOLEAN,
        parking: DataTypes.BOOLEAN,
        storage: DataTypes.BOOLEAN,
        description: DataTypes.TEXT,
        imageLinks: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true,
        },
        localImages: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true,
        },
    }, {
        tableName: 'SaleDetails',
    });

    SaleDetail.associate = (models) => {
        SaleDetail.belongsTo(models.Property, { foreignKey: 'propertyId', as: 'property' });
    };

    return SaleDetail;
}; 