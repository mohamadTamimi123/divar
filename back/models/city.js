// models/city.js
module.exports = (sequelize, DataTypes) => {
    const City = sequelize.define('City', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
    }, {
        tableName: 'Cities',
    });

    City.associate = (models) => {
        City.hasMany(models.Neighborhood, { foreignKey: 'cityId', as: 'neighborhoods' });
        City.hasMany(models.Property, { foreignKey: 'cityId', as: 'properties' });
    };

    return City;
};
