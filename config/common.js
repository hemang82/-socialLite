var Connection = require('./database');
var Nodemailer = require('nodemailer');
var moment = require('moment');
var stripe = require('stripe')('pk_test_51NUqIDSCvOBGqOdZYf9AmnyNtAI6UGq6VlL9J191HbBW2OE80n7mXVgEPaq8QXyyrOyo2X50XRsawY0U0jR0YldV00PolltjSc');


var common = {

    /* Send Email  */
    sendEmail: (toemail, subject, message, callback) => {

        var transporter = Nodemailer.createTransport({
            service: 'gmail',
            auth: {

                user: 'hemangchandekar82@gmail.com',
                pass: 'nkmjpfscishoopio'
            }
        });
        var mailOptions = {
            from: 'hlis.infosystem@gmail.com',
            to: toemail,
            subject: subject,
            html: message
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {

                console.log(`Email Sent Error : | ${toemail} |  ${error} |`);
                callback(false);
            } else {

                console.log(`Email Sent:  |  ${toemail}  |   ${info.response} |`);
                callback(true);
            }
        });
    },

    /* Cheak Update User Token */
    cheakUpdateToken: (request, callback) => {

        var randtoken = require('rand-token').generator();
        var usersession = randtoken.generate(64, '0123456789abcdefghijklmnopqrstuvwxyz');

        Connection.query('SELECT * FROM tbl_user_deviceinfo WHERE user_id = ? ', [request.user_id], (error, result) => {

            if (!error && result.length > 0) {

                var updatetoken = {
                    token: usersession,
                    device_type: (request.device_type != '' && request.device_type != undefined) ? request.device_type : 'A',
                    device_token: (request.device_token != '' && request.device_token != undefined) ? request.device_token : '123',
                    login_status: 'online',
                    last_seen: moment().format('YYYY/MM/DD hh:mm:ss'),
                    updated_at: moment().format('YYYY/MM/DD hh:mm:ss'),
                }
                common.updateTbldevice(request.user_id, updatetoken, (is_true) => {
                    if (is_true) {

                        callback(usersession);
                    } else {

                        callback('session expire');
                    }
                });
            } else {

                var deviceperms = {
                    user_id: request.user_id,
                    token: usersession,
                    device_type: (request.device_type != '' && request.device_type != undefined) ? request.device_type : 'A',
                    device_token: (request.device_token != '' && request.device_token != undefined) ? request.device_token : '123',
                    login_status: 'online',
                    last_seen: moment().format('YYYY/MM/DD hh:mm:ss'),
                    created_at: moment().format('YYYY/MM/DD hh:mm:ss'),
                    updated_at: moment().format('YYYY/MM/DD hh:mm:ss'),
                }
                Connection.query('INSERT INTO tbl_user_deviceinfo SET ? ', [deviceperms], (error, result) => {
                    if (!error) {

                        callback(usersession);
                    }
                    else {

                        callback('session expire');
                    }
                });
            }
        });
    },

    /*update tbl_user_deviceinfo */
    updateTbldevice: (user_id, updatedata, callback) => {

        var updated_at = moment().format('YYYY/MM/DD hh:mm:ss');
        var sql = `UPDATE tbl_user_deviceinfo SET ? , updated_at = '${updated_at}' WHERE user_id = ?`;
        Connection.query(sql, [updatedata, user_id], (error, result) => {
            if (!error) {
                callback(true);
            } else {

                callback(false);
            }
        });
    },

    /* STRIPE TOKEN */
    createToken: (cardobj, callback) => {
        stripe.tokens.create(
            {
                card: cardobj
            },
            function (error, token) {
                if (!error) {
                    console.log('card',token)
                    const tokenId = token.id;
                    callback(token)
                } else {
                    callback(null);
                }
            }
        );

    },
}

module.exports = common;