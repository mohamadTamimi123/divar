'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ClientFile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ClientFile.belongsTo(models.Client, { foreignKey: 'clientId', as: 'client' });
      ClientFile.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }
  
  ClientFile.init({
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Clients',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fileType: {
      type: DataTypes.ENUM('property', 'crawled', 'generated'),
      defaultValue: 'property'
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isNew: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    matchScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Score from 0-100 indicating how well this file matches the client requirements'
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Additional metadata about the file and its relationship to the client'
    }
  }, {
    sequelize,
    modelName: 'ClientFile',
    tableName: 'ClientFiles',
    timestamps: true,
    indexes: [
      {
        fields: ['clientId', 'userId']
      },
      {
        fields: ['isNew']
      },
      {
        fields: ['fileType']
      }
    ]
  });
  
  return ClientFile;
}; 