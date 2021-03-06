const Sequelize = require('sequelize');
const sequelize = require('../db/database');
const {syncTable} = require('./util');

const Message = sequelize.define('message', {
    content: Sequelize.STRING,
    from: Sequelize.STRING,
    to: Sequelize.STRING,
    isWithDraw: Sequelize.BOOLEAN,
    chatId: Sequelize.STRING,
    type: Sequelize.STRING
});

syncTable(Message);

module.exports = Message;
