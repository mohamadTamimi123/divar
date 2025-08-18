// models/property.js
module.exports = (sequelize, DataTypes) => {
    const Property = sequelize.define('Property', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        metraj: DataTypes.STRING,
        cityId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Cities',
                key: 'id',
            },
            onDelete: 'SET NULL',
        },
        neighborhoodId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Neighborhoods',
                key: 'id',
            },
            onDelete: 'SET NULL',
        },
        location: DataTypes.STRING,
        locationImage: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        coverImage: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        type: {
            type: DataTypes.ENUM('sale', 'rent', 'land', 'partnership'),
            allowNull: false,
        },
        adLink: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'لینک اصلی آگهی در دیوار یا سایر سایت‌ها'
        },
    }, {
        tableName: 'Properties',
    });

    Property.associate = (models) => {
        Property.belongsTo(models.City, { foreignKey: 'cityId', as: 'city' });
        Property.belongsTo(models.Neighborhood, { foreignKey: 'neighborhoodId', as: 'neighborhood' });
        Property.hasOne(models.SaleDetail, { foreignKey: 'propertyId', as: 'saleDetail' });
        Property.hasOne(models.RentDetail, { foreignKey: 'propertyId', as: 'rentDetail' });
    };

    Property.prototype.toJSON = function () {
        const values = Object.assign({}, this.get());
        values.city = values.city && values.city.name ? values.city.name : null;
        values.neighborhood = values.neighborhood && values.neighborhood.name ? values.neighborhood.name : null;
        delete values.cityId;
        delete values.neighborhoodId;
        return values;
    };

    return Property;
}; 