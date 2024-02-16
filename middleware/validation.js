const { default: localizify } = require('localizify');
const Validator = require('Validator');
const en = require('../language_file/en');
const gu = require('../language_file/gu');
const { t } = require('localizify');
const cryptoLib = require('cryptlib');
const Connection = require('../config/database');
const connection = require('../config/database');

const shakey = cryptoLib.getHashSha256(process.env.KEY, 32);

var validation = {

    /* API Validation */
    cheakValidation: (reqest, res, rules, message) => {

        const v = Validator.make(reqest, rules, message);
        if (v.fails()) {
            const errors = v.getErrors();
            var error = "";
            for (const element in errors) {
                error = errors[element][0];
                break;
            }
            res.status(200).send(error);
            // validation.encryption(error,(response)=>{
            //     res.status(200).send(response);
            // });
            return false;
        }
        else {
            return true;
        }
    },

    /* API Response */
    response: (req, res, code, message, data) => {

        var responsedata = {};
        validation.getmessage(req.lang, message, (translated_message) => {

            if (data == null) {

                responsedata = {
                    code: code,
                    message: translated_message,
                }

                res.status(200).send(responsedata);
                //     validation.encryption(responsedata,(response)=>{
                //     res.status(200).send(response);
                // });
            }
            else {
                responsedata = {
                    code: code,
                    message: translated_message,
                    data: data
                }

                res.status(200).send(responsedata);
                // validation.encryption(responsedata,(response)=>{
                // res.status(200).send(response);
                // });
            }
        });
    },

    getmessage: (language, message, callback) => {

        localizify
            .add('en', en)
            .add('gu', gu)
            .setLocale(language);

        callback(t(message.keyword, message.content));
    },

    /* Header Language */
    extrectHeaderLanguage: (request, res, callback) => {

        var headerlang = (request.headers['accept-language'] != undefined && request.headers['accept-language'] != "") ? request.headers['accept-language'] : 'en';
        request.lang = headerlang;
        request.language = (headerlang == 'en') ? en : gu;

        callback();
    },

    /* API Key */
    validateApiKey: (req, res, callback) => {

        var uniqendpoint = req.path.split('/');
        var bypass = new Array('resetfile', 'reset_password');
        var api_key = (req.headers['api-key'] != undefined && req.headers['api-key'] != "") ? req.headers['api-key'] : '';

        if (bypass.includes(uniqendpoint[4])) {

            callback();
        } else {

            if (api_key != "") {

                api_dec = cryptoLib.decrypt(api_key, shakey, process.env.IV);
                if (api_dec != "" && api_dec == process.env.API_KEY) {

                    callback();
                } else {
                    console.log('else-------');
                    responsedata = {
                        code: 401,
                        message: 'Invalid Api Key'
                    }
                    console.log(responsedata);
                    validation.encryption(responsedata, (response) => {
                        res.status(401).send(response);
                    });
                }
            } else {

                responsedata = {
                    code: 401,
                    message: 'Invalid Api Key'
                }
                validation.encryption(responsedata, (response) => {
                    res.status(401).send(response);
                });
            }
        }
    },

    /* User Token */
    validateToken: (req, res, callback) => {

        var uniqendpoint = req.path.split('/');
        var bypass = new Array('signup', 'login', 'forgot_password', 'resetfile', 'reset_password');
        var token = (req.headers['token'] != undefined && req.headers['token'] != "") ? req.headers['token'] : '';

        if (bypass.includes(uniqendpoint[4])) {

            callback();
        } else {
            if (token != "") {

                try {
                    token_dec = cryptoLib.decrypt(token, shakey, process.env.IV);
                    Connection.query("SELECT * FROM tbl_user_deviceinfo WHERE token = ? AND is_active = 1 AND is_delete = 0 ", [token_dec], (error, result) => {
                        if (!error && result.length > 0) {

                            req.user_id = result[0].user_id;
                            callback();
                        } else {

                            responsedata = {
                                code: 0,
                                message: 'Invalid Token',
                            }
                            console.log(responsedata);
                            validation.encryption(responsedata, (response) => {
                                res.status(401).send(response);
                            });
                        }
                    });
                } catch (error) {
                    console.log(error);
                    responsedata = {
                        code: 0,
                        message: 'Invalid token'
                    }
                    console.log(responsedata);
                    validation.encryption(responsedata, (response) => {
                        res.status(401).send(response);
                    });
                }
            } else {

                responsedata = {
                    code: 0,
                    message: 'Invalid token',
                    data: {}
                }
                console.log(responsedata);
                validation.encryption(responsedata, (response) => {
                    res.status(401).send(response);
                });
            }
        }
    },

    /* decrypt */
    decryption: (encrypted_text, callback) => {
        if (encrypted_text != undefined && Object.keys(encrypted_text).length !== null) {
            try {
                var request = JSON.parse(cryptoLib.decrypt(encrypted_text, shakey, process.env.IV));
                callback(request);
            } catch (error) {
                callback({});
            }
        } else {
            callback({});
        }
    },

    /* encryption */
    encryption: (response_data, callback) => {

        var response = cryptoLib.encrypt(JSON.stringify(response_data), shakey, process.env.IV);
        callback(response);

    }

}
module.exports = validation;