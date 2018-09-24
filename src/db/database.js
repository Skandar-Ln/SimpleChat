const Sequelize = require('sequelize');

let database = 'chat_temp';

if (process.env.NODE_ENV === 'dev') {
    database = 'chat_test';
}

const sequelize = new Sequelize(database, 'xxxx', 'xxxxx', {
    host: 'xxxx',
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
