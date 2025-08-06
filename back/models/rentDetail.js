// models/rentDetail.js
module.exports = (sequelize, DataTypes) => {
    const RentDetail = sequelize.define('RentDetail', {
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
        deposit: DataTypes.STRING,
        rent: DataTypes.STRING,
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
        tableName: 'RentDetails',
    });

    RentDetail.associate = (models) => {
        RentDetail.belongsTo(models.Property, { foreignKey: 'propertyId', as: 'property' });
    };

    return RentDetail;
}; 