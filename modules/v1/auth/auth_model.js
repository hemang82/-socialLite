const Connection = require('../../../config/database');
const Middleware = require('../../../middleware/validation');
const Common = require('../../../config/common');
const Template = require('../../../config/template');
var moment = require('moment');

var Auth = {

    /*====================================================
        signup
    ====================================================== */
    signUp: (request, callback) => {

        Auth.cheakUserEmail(request, (is_true) => {

            if (is_true) {

                callback('0', { keyword: 'email_already_used', content: {} }, {})
            } else {

                Auth.cheakUserMobileNumber(request, (is_true) => {
                    if (is_true) {

                        callback('0', { keyword: 'mobile_number_already_used', content: {} }, {})
                    } else {
                        var encPassword;
                        Middleware.encryption(request.password, (data) => {
                            encPassword = data;
                        });
                        console.log(encPassword);
                        var insertData = {
                            role: request.role,
                            fullname: request.fullname,
                            email: request.email,
                            password: encPassword,
                            country_code: request.country_code,
                            mobile_number: request.mobile_number,
                            location: request.location,
                            profile_image: (request.profile_image != '' && request.profile_image != undefined) ? request.profile_image : 'default.jpg',
                            about: request.about,
                            created_at: moment().format('YYYY/MM/DD hh:mm:ss'),
                            update_at: moment().format('YYYY/MM/DD hh:mm:ss'),
                        }
                        var sql = `INSERT INTO tbl_user SET ? `

                        Connection.query(sql, [insertData], (error, result) => {
                            if (!error) {
                                request.user_id = result.insertId;
                                Common.cheakUpdateToken(request, (token) => {
                                    Auth.getUserDetials(request, (userDetials) => {
                                        userDetials.token = token;
                                        callback('1', { keyword: 'sucess', content: {} }, { userDetials })
                                    });
                                });
                            } else {
                                console.log(error);
                                callback('0', { keyword: 'not_sucess', content: {} }, {})
                            }
                        });
                    }
                });
            }
        });
    },

    /*==================================================== 
        login                                                                              
    ====================================================== */
    login: (request, callback) => {

        var sql = `SELECT * FROM tbl_user WHERE email = '${request.email}' `;
        Connection.query(sql, (error, result) => {
            if (!error && result.length > 0) {

                var userDetials = result[0];
                var decPassword;

                Middleware.decryption(userDetials.password, (data) => {
                    decPassword = data;
                });
                if (decPassword != request.password) {

                    callback('0', { keyword: 'password_not_metch', content: {} }, {})
                } else if (userDetials.is_active == 0 || userDetials.is_delete == 1) {

                    callback('0', { keyword: 'please_contect_admin', content: {} }, {})
                } else {

                    request.user_id = userDetials.id;
                    Common.cheakUpdateToken(request, (token) => {
                        Auth.getUserDetials(request, (userdata) => {

                            userdata.token = token;
                            callback('1', { keyword: 'login_sucess', content: {} }, { userDetials: userdata })
                        });
                    });
                }
            } else {

                callback('0', { keyword: 'email_not_register', content: {} }, {})
            }
        });
    },

    /*==================================================== 
        forgot password                                                                              
    ====================================================== */
    forgotPassword: (request, callback) => {

        var sql = `SELECT id,email FROM tbl_user WHERE email = ? AND is_active = 1 AND is_delete = 0  `;

        Connection.query(sql, [request.email], (error, result) => {
            if (!error && result.length > 0) {

                Template.forgotEmail(result[0], (forgottemplate) => {
                    Common.sendEmail(request.email, 'Forgot Password', forgottemplate, (is_true) => {
                        callback('1', { keyword: 'email_sent_sucess', content: {} }, { email: result[0] })
                    });
                })
            } else {

                callback('0', { keyword: 'email_sent_not_sucess', content: {} }, {});
            }
        });
    },

    /*==================================================== 
        reset password                                                                                  
    ====================================================== */
    resetPassword: (request, res, callback) => {
        let encpassword;
        Middleware.encryption(request.password, (data) => {
            encpassword = data;
        });
        let updatedata = {
            password: encpassword,
            password_update_time: moment().format('YYYY/MM/DD hh:mm:ss')
        }
        Auth.updateUser(request, updatedata, (is_true) => {
            if (is_true) {
                res.render('sucess.html');
            } else {
                res.render('unsucess.html');
            }
        });
    },

    /*==================================================== 
        logout                                                                              
    ====================================================== */
    logout: (request, callback) => {

        var updatedata = {
            token: '',
            login_status: 'offline',
            device_token: '',
            device_type: '',
            last_seen: moment().format('YYYY/MM/DD hh:mm:ss'),
        };
        Common.updateTbldevice(request.user_id, updatedata, (is_true) => {
            if (is_true) {

                callback('1', { keyword: 'user_logout', content: {} }, {})
            } else {

                callback('0', { keyword: 'user_not_logout', content: {} }, {})
            }
        });
    },

    /* Get User Detials */
    getUserDetials: (request, callback) => {
        var sql = `SELECT * FROM tbl_user WHERE id = ${request.user_id} AND is_active = 1  AND is_delete = 0 `;

        Connection.query(sql, (error, result) => {
            if (!error && result.length > 0) {

                delete result[0].password;
                callback(result[0])
            } else {

                callback({})
            }
        });
    },

    /* update user*/
    updateUser: (request, updateData, callback) => {

        let update_at = moment().format('YYYY/MM/DD hh:mm:ss');
        var sql = `UPDATE tbl_user SET ? ,update_at = '${update_at}' WHERE id = ? `

        Connection.query(sql, [updateData, request.user_id], (error, result) => {
            if (!error && result.affectedRows > 0) {

                callback(true)
            } else {
                callback(false)
            }
        });
    },

    /* Cheak User Email */
    cheakUserEmail: (request, callback) => {

        var sql = `SELECT id,email FROM tbl_user WHERE email = '${request.email}' AND is_active = 1 AND is_delete = 0 `;

        Connection.query(sql, (error, result) => {
            console.log(sql);
            if (!error && result.length > 0) {

                callback(true)
            } else {

                callback(false)
            }
        });
    },

    /* Cheak User mobile number */
    cheakUserMobileNumber: (request, callback) => {

        var sql = `SELECT * FROM tbl_user WHERE mobile_number = ${request.mobile_number} AND is_active = 1 AND is_delete = 0 `;

        Connection.query(sql, (error, result) => {
            if (!error && result.length > 0) {

                callback(true)
            } else {

                callback(false)
            }
        });
    }

}

module.exports = Auth;