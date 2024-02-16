const Mysql = require('mysql');

var con = {
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE_NAME
}

var connection = Mysql.createPool(con);

connection.getConnection((error, conn) => {

    if (error) {

        console.log(' Cant connect to database, Check youre database connection');
    }
});

module.exports = connection;