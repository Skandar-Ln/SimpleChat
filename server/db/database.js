const Sequelize = require('sequelize');
const {database: CONFIG} = require('../config/config.json');

let database = CONFIG.databaseName;

if (process.env.NODE_ENV !== 'production') {
    database = 'chat_test';
}

const sequelize = new Sequelize(database, CONFIG.user, CONFIG.password, {
    host: CONFIG.host,
    dialect: 'mysql',

    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

sequelize
    .authenticate()
    .then(() => {
    console.log('Connection has been established successfully.');
    })
    .catch(err => {
    console.error('Unable to connect to the database:', err);
    });

module.exports = sequelize;
