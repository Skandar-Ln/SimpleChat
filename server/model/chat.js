const Sequelize = require('sequelize');
const sequelize = require('../db/database');
const {syncTable} = require('./util');

const Chat = sequelize.define('chat', {
    chatId: Sequelize.STRING,
    key: Sequelize.STRING
});

syncTable(Chat);

module.exports = Chat;
