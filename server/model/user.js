const Sequelize = require('sequelize');
const sequelize = require('../db/database');
const {syncTable} = require('./util');

const User = sequelize.define('user', {
    name: Sequelize.STRING,
    password: Sequelize.STRING,
    chatId: Sequelize.STRING,
});

syncTable(User);

module.exports = User;
