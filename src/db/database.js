const Sequelize = require('sequelize');

let database = 'chat';

if (process.env.NODE_ENV === 'dev') {
    database = 'chat_test';
}

const sequelize = new Sequelize(database, 'root', '123456', {
    host: 'www.bulibuli.wang',
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
