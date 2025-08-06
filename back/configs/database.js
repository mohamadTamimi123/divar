// config/database.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('mydb_db', 'myuser', 'mypass', {
    host: 'localhost',
    dialect: 'postgres',
    logging: false, // برای جلوگیری از لاگ زیاد
});

module.exports = sequelize;
