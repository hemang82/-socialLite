const express = require('express');
const router = express.Router();
const Model = require('../modules/v1/auth/auth_model');
const Middleware = require('../middleware/validation');
var cron = require('node-cron');
const connection = require('../config/database');
asyncLoop = require('node-async-loop');


var cronevent_rotation = new cron.CronJob({
    cronTime: '*/1 * * * *',
    onTick: function () {
        console.log("1 min cron")

        var sql = `SELECT * from tbl_booking`;
        connection.query(sql, (err, result) => {

            if (!err && result.length > 0) {
                var currenttime = moment().format('hh:mm:ss');
                console.log('---', currenttime);
                if (currenttime > result[0].end_time) {

                    var sql = `update tbl_booking SET status = 'cancel' WHERE id = 4`
                    connection.query(sql, (error, result) => {
                        if (!error) {
                            console.log('data updated!');
                        } else {
                            console.log('not updated');
                        }
                    })
                }
            }
        })

        //cron for checking order accepted or not
        auth_model.checkjoinornot(function (isCronRun) {
            if (isCronRun) {
                console.log(isCronRun);
            }
            else {
                console.log(isCronRun);
            }
        });
    },

    start: true,
    timeZone: 'Asia/Kolkata'
});
