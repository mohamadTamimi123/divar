// models/neighborhood.js
module.exports = (sequelize, DataTypes) => {
    const Neighborhood = sequelize.define('Neighborhood', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        cityId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Cities',
                key: 'id',
            },
        },
    }, {
        tableName: 'Neighborhoods',
    });

    Neighborhood.associate = (models) => {
        Neighborhood.belongsTo(models.City, { foreignKey: 'cityId', as: 'city' });
        Neighborhood.hasMany(models.Property, { foreignKey: 'neighborhoodId', as: 'properties' });
    };

    return Neighborhood;
};
