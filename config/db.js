const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('wt24', 'root', 'password', {
    host: 'mysql-db', //localhost mysql-db
    dialect: 'mysql' ,
    define: {
        freezeTableName: true, 
      },
});

module.exports = sequelize;