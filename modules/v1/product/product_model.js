const Connection = require('../../../config/database');
const Global = require('../../../config/constent');
const Common = require('../../../config/common');
const Template = require('../../../config/template');
const { default: Stripe } = require('stripe');
const common = require('../../../config/common');
var stripe = require('stripe')('sk_test_51NUqIDSCvOBGqOdZuWYbswUYOZcHE7rAcsRUx80xvUoSIf1UPSZugxUdduMyQgM0f0dfej5aC5FSR5gnW6BiukKH00TtsoMNtl');
var moment = require('moment');
var asyncLoop = require('node-async-loop');
const { log } = require('console');
const connection = require('../../../config/database');
const twilio = require('twilio');
const accountSid = 'AC122b8ba3e0dbec02cbb18a8dc2a12387';
const authToken = 'd77c00221bc768d7edbb13e7a545b020';
const client = twilio(accountSid, authToken);
const axios = require('axios');
// var https = require('follow-redirects').https;
var fs = require('fs');
const https = require('https');

/* soket pakage  */

const express = require('express');

const app = express();

// -------------------------------------------


// const { Client } = require('whatsapp-business');
const { Client } = require('whatsapp-web.js');



// CONCAT('Global.BASE_URL','Global.USER_URL',u.profile_image);

var product = {

    /*==================================================== 
        stripe payment gatway  start                                                                          
    ====================================================== */

    createCustomer: (request, callback) => {

        var cardobj = {
            name: request.name,
            number: request.card_number,
            exp_month: request.exp_month,
            exp_year: request.exp_year,
            cvc: request.cvc
        }
        Common.createToken(cardobj, (token) => {
            console.log('main token', token.id);
            stripe.customers.create(
                {
                    email: request.email,
                    name: request.name,
                    description: 'best option for strip',
                },
                function (err, customer) {
                    if (!err) {

                        console.log('Customer ID:', customer.id, 'Customer name:', customer.email);
                        product.createCardCustomer(customer.id, token.id, (cardDetials) => {
                            if (cardDetials != null) {

                                var expiry_date = `${request.exp_month}/${request.exp_year}`;
                                var insertdata = {
                                    user_id: request.user_id,
                                    card_type: cardDetials.funding,
                                    card_number: request.card_number,
                                    card_holder: cardDetials.name,
                                    expiry_date: expiry_date,
                                    fingerprint: cardDetials.fingerprint,
                                    card_token: token.card.id,
                                    crad_id: cardDetials.id,
                                    customer_id: customer.id,
                                }
                                var sql = `INSERT INTO tbl_card SET ?`;
                                Connection.query(sql, [insertdata], (error, result) => {
                                    if (!error) {

                                        callback('1', { keyword: "customer_created", content: {} }, {})
                                    } else {
                                        console.log(error);
                                        callback('0', { keyword: "customer_not_inserted", content: {} }, {})
                                    }
                                });
                            } else {

                                callback('0', { keyword: "customer_not_created", content: {} }, {})
                            }
                        });
                    } else {

                        callback('0', { keyword: "customer_not_created", content: {} }, {})
                    }
                }
            );
        })
    },

    createCardCustomer: (coustomer_id, token, callback) => {
        console.log('coustomer_id', coustomer_id);
        stripe.customers.createSource(coustomer_id, { source: token }, function (err, card) {
            if (card) {
                console.log("success card: " + JSON.stringify(card, null, 2));
                console.log('card', card);
                callback(card);
            } if (err) {
                // console.log("err: " + err);
                callback(null);
            } else {
                console.log("Something wrong")
            }
        })
    },

    createAccount: (request, callback) => {
        var cardobj = {
            name: request.name,
            number: request.card_number,
            exp_month: request.exp_month,
            exp_year: request.exp_year,
            cvc: request.cvc
        }
        product.cheakcard(request, cardobj, (token) => {
            if (token != null) {

                var fs = require('fs');
                var fp = fs.readFileSync('public/user_image/banck.jpg');
                var file = {};
                stripe.files.create({
                    purpose: 'identity_document',
                    file: {
                        data: fp,
                        name: 'image_1234.jpg',
                        type: 'application/octet-stream'
                    },
                }, (error, fileupload) => {

                    file = fileupload
                    console.log(file.id);
                    var account_data = {

                        type: 'standard',
                        country: 'US',
                        email: 'hemangchandekar@gmail.com',
                        business_type: 'individual',
                        requested_capabilities: ['card_payments', 'transfers'],
                        business_profile: {
                            mcc: '5965',
                            name: 'hemangchandekar',
                            // url  : "www.ealiox.com",
                            product_description: "",
                        },
                        individual: {
                            address: {
                                state: 'gujrat',
                                city: 'ahmedabad',
                                postal_code: '382418',
                                line1: 'vastarl',
                            },
                            dob: {
                                day: 21,
                                month: 07,
                                year: 2001,
                            },
                            // ssn_last_4       : ssn_last_4,
                            id_number: '1234',
                            email: 'hemangchandekar82@gmail.com',
                            first_name: 'Hemang ',
                            last_name: "Chandekar",
                            phone: '8238403910',
                            verification: {
                                document: {
                                    front: fileupload.id
                                },
                                additional_document: {
                                    front: fileupload.id
                                },
                            },
                        },
                        tos_acceptance: {
                            date: Math.floor(Date.now() / 1000),
                            ip: '192.168.0.104',
                        },
                        external_account: {
                            object: 'bank_account',
                            country: '+91',
                            currency: 'india',
                            bank_name: 'indian bank',
                            account_holder_name: 'hemang prakashbhai chandekar',
                            account_number: '	4111111117444490',
                            routing_number: '123456789',
                        }
                    };

                    stripe.accounts.create(Object.assign(account_data, { external_account: token.id }), (error, account) => {
                        if (!error && account != undefined) {
                            stripe.accounts.createExternalAccount(account.id, { external_account: '123' }, (err, bankAccount) => {
                                if (!err && bankAccount != undefined) {
                                    console.log('success', bankAccount);
                                } else {
                                    console.log('bank account error', error);
                                }
                            });
                        } else {

                            console.log('bank account error--', error);
                        }
                    });
                })
            } else {
                console.log('card already add');
            }
        });
    },

    cheakcard: (request, cardobj, callback) => {
        console.log('user_id ---------->', request.user_id);
        common.createToken(cardobj, function (token) {
            if (token != null) {

                var sql = `SELECT * FROM tbl_card WHERE user_id = ${request.user_id} AND fingerprint = ${token.card.fingerprint} AND is_active = 1 AND is_delete = 0`;
                Connection.query(sql, (error, result) => {
                    if (!error && result.length > 0) {

                        console.log('card alredy exist');
                        callback(null);

                    } else {

                        stripe.customers.create(
                            {
                                email: request.email,
                                name: request.name,
                                description: 'best option for strip',
                            },
                            function (err, customer) {
                                if (!err) {

                                    console.log('Customer ID:', customer.id, 'Customer name:', customer.email);
                                    product.createCardCustomer(customer.id, token.id, (cardDetials) => {
                                        if (cardDetials != null) {

                                            var expiry_date = `${request.exp_month}/${request.exp_year}`;
                                            var insertdata = {
                                                user_id: request.user_id,
                                                card_type: cardDetials.funding,
                                                card_number: request.card_number,
                                                card_holder: cardDetials.name,
                                                expiry_date: expiry_date,
                                                fingerprint: cardDetials.fingerprint,
                                                card_token: token.card.id,
                                                crad_id: cardDetials.id,
                                                customer_id: customer.id,
                                            }
                                            var sql = `INSERT INTO tbl_card SET ?`;
                                            Connection.query(sql, [insertdata], (error, result) => {
                                                if (!error) {

                                                    console.log(result);
                                                    callback(token)
                                                } else {

                                                    console.log('-------------->return');
                                                    console.log(error);
                                                    callback(null)
                                                }
                                            });
                                        } else {
                                            callback(null)
                                        }
                                    });
                                } else {
                                    console.log('-----err', err);
                                    callback(null)
                                }
                            }
                        );

                    }
                });
            };
        })
    },

    deleteCustomer: (request, callback) => {
        connection.query(`SELECT * FROM tbl_user where ${request.user_id}`, (err, result) => {
            if (!err && result.length > 0) {
                callback('1', { keyword: 'sucess', content: {} }, result)
            } else {
                callback('0', { keyword: 'not_sucess', content: {} }, {})
            }
        });
    },

    getAllCustomers: (request, callback) => {

        stripe.customers.list({ limit: 4 }, function (err, customers) {
            if (err) {
                console.log("err: " + err);
            } if (customers) {
                console.log("success: " + JSON.stringify(customers.data, null, 2));
            } else {
                console.log("Something wrong")
            }
        })
    },

    addFundsToBalance: (request, callback) => {

        var customerId = 'cus_OIAf6PCIsgJqHc';
        var amount = 5000;
        var data = {
            amount,
            currency: 'usd',
            customer: customerId,
            description: 'Adding funds to balance'
            // source_type: 'card',
        }
        stripe.balanceTransactions.create(data, (err, balanceTransaction) => {
            if (err) {
                console.error('Error adding funds to balance:', err);
                // callback(err);
            } else {
                console.log('Funds added to balance:', balanceTransaction);
                // Perform any additional actions after adding funds to balance
                console.log(balanceTransaction)
            }
        }
        );
    },

    /*==================================================== 
        all sunday in year                                                                             
    ====================================================== */

    // getAllSundayyy: (request, callback) => {

    //     const year = 2023;
    //     const month = july;
    //     product.allSunday(year,month, (sundays) => {

    //         callback('1', { keyword: "calander_found", content: {} }, { sundays: sundays })
    //     });
    // },

    // allSundayyy: (year, callback) => {

    //     const sundays = [];
    //     const firstDayOfYear = moment(year, "YYYY").startOf("year");
    //     const lastDayOfYear = moment(year, "YYYY").endOf("year");

    //     var currentDay = firstDayOfYear.clone().day(0); // Sunday


    //     while (currentDay.isBefore(lastDayOfYear)) {
    //         sundays.push(currentDay.format("DD-MM-YYYY"));
    //         currentDay.add(7, "days");
    //     }

    //     callback(sundays);
    // },


    getAllSundayy: (request, callback) => {
        const year = 2023;
        const month = 'July';

        product.allSunday(year, (sundays) => {
            const sundaysOfSpecificMonth = [];
            sundays.forEach((date) => {
                if (moment(date, "DD-MM-YYYY").format("MMMM") === month) {
                    sundaysOfSpecificMonth.push(date);
                }
            });

            callback('1', { keyword: "calendar_found", content: {} }, { sundays: sundaysOfSpecificMonth });
        });
    },

    allSundayy: (year, callback) => {
        const sundays = [];
        const firstDayOfYear = moment(year, "YYYY").startOf("year");
        const lastDayOfYear = moment(year, "YYYY").endOf("year");

        for (let currentDay = firstDayOfYear.clone().day(0); currentDay.isBefore(lastDayOfYear); currentDay.add(7, "days")) {
            sundays.push(currentDay.format("DD-MM-YYYY"));
        }

        callback(sundays);
    },

    allSundayy: (year, callback) => {
        const sundays = [];
        const firstDayOfYear = moment(year, "YYYY").startOf("year");
        const lastDayOfYear = moment(year, "YYYY").endOf("year");

        let currentDay = firstDayOfYear.clone().day(0); // Sunday

        while (currentDay.isBefore(lastDayOfYear)) {
            sundays.push(currentDay.format("DD-MM-YYYY"));
            currentDay.add(7, "days");
        }

        callback(sundays);
    },
    // Assuming the 'product' object is defined somewhere.
    getAllSunday: (request, callback) => {
        const year = 2023;
        const month = 'May';
        var monthday = `${year}-${month}`;
        console.log(monthday);
        console.log(moment('2023-07-21', "YYYY-MM-DD").format("MMMM"));
        product.allSunday(year, (sundays) => {
            const sundaysOfSpecificMonth = sundays.filter((date) => {
                return moment(date, "DD-MM-YYYY").format("MMMM") === month;
            });

            callback('1', { keyword: "calendar_found", content: {} }, { sundays: sundaysOfSpecificMonth });
        });
    },
    allSunday: (year, callback) => {
        const sundays = [];
        const firstDayOfYear = moment(year, "YYYY").startOf("year");
        const lastDayOfYear = moment(year, "YYYY").endOf("year");

        for (let currentDay = firstDayOfYear.clone().day(0); currentDay.isBefore(lastDayOfYear); currentDay.add(7, "days")) {
            sundays.push(currentDay.format("DD-MM-YYYY"));
        }

        callback(sundays);
    },

    /*==================================================== 
        sms sent using twilio simple sms                                                                              
    ====================================================== */

    // sms: (request, callback) => {
    //     client.messages
    //         .create({
    //             from: 'whatsapp:+12543585607', // Your Twilio WhatsApp number
    //             to: 'whatsapp:+918238403910',
    //             body: 'Hello from Twilio!'
    //         })
    //         .then(message => console.log(message.sid, message))
    //         .catch(err => console.error(err));


    // },

    sms: (request, callback) => {

        client.messages
            .create({
                from: 'whatsapp:+12543585607', // Replace with your Twilio WhatsApp number
                to: 'whatsapp:+918238403910',  // Replace with the recipient's WhatsApp number
                body: 'Hello from Twilio!'
            })
            .then(message => console.log(message.sid, message))
            .catch(err => console.error(err));
    },

    // Function to send WhatsApp message
    //     Call the function to send the message
    //     product.sendWhatsAppMessage('+14155238886', '+918238403910', 'Hello from Twilio!');
    //},

    sendWhatsAppMessage: (fromNumber, toNumber, messageBody) => {
        client.messages
            .create({
                from: `${fromNumber}`, // Replace with your Twilio WhatsApp number
                to: `${toNumber}`,     // Replace with the recipient's WhatsApp number
                body: messageBody
            })
            .then(message => console.log(`Message SID: ${message.sid}`))
            .catch(error => console.error(error));
    },

    /*==================================================== 
        whatsapp message                                                                     
    ====================================================== */

    // whatsapp_message: (request, callback) => {

    //     const phoneNumber = '+918238403910';
    //     const clientId = 'YOUR_CLIENT_ID';
    //     const clientSecret = 'YOUR_CLIENT_SECRET';

    //     const client = new Client({
    //         phoneNumber: phoneNumber,
    //         clientId: clientId,
    //         clientSecret: clientSecret,
    //     });

    //     // Define a callback function for sending messages
    //     function sendMessageCallback(recipientNumber, message, callback) {
    //         client.sendMessage(recipientNumber, message)
    //             .then(response => {
    //                 callback(null, response); // Pass null as the first argument to indicate success
    //             })
    //             .catch(error => {
    //                 callback(error, null); // Pass the error as the first argument
    //             });
    //     }

    //     // Usage example with callbacks
    //     const recipientNumber = 'RECIPIENT_PHONE_NUMBER'; // Replace with the recipient's phone number
    //     const messageToSend = 'Hello from WhatsApp Business API in Node.js!';

    //     sendMessageCallback(recipientNumber, messageToSend, (error, response) => {
    //         if (error) {
    //             console.error('Error sending message:', error);
    //         } else {
    //             console.log('Message sent:', response);
    //         }
    //     });
    // },

    // whatsapp_message: (request1, callback) => {

    //     var https = require('follow-redirects').https;

    //     function sendWhatsAppMessage(callback) {
    //         var options = {
    //             method: 'POST',
    //             hostname: 'api.infobip.com',
    //             path: '/whatsapp/1/message/text',
    //             headers: {
    //                 Authorization: '4cc36af09901c59722b131aa30c3c21b-08af68e2-09c8-45af-96ff-570928730cfa', // Replace YOUR_INFOBIP_API_KEY with your actual Infobip API key
    //                 'Content-Type': 'application/json',
    //                 Accept: 'application/json'
    //             },
    //             maxRedirects: 20
    //         };

    //         var req = https.request(options, function (res) {
    //             var chunks = [];

    //             res.on("data", function (chunk) {
    //                 chunks.push(chunk);
    //             });

    //             res.on("end", function (chunk) {
    //                 var body = Buffer.concat(chunks);
    //                 console.log(body.toString());
    //                 callback(null, body.toString());
    //             });

    //             res.on("error", function (error) {
    //                 console.error(error);
    //                 callback(error);
    //             });
    //         });
    //         var postData = JSON.stringify({
    //             from: 'InfoSMS', // Replace 'InfoSMS' with a valid WhatsApp sender ID provided by Infobip
    //             to: '918238403910', // Replace 'RECIPIENT_PHONE_NUMBER' with the phone number you want to send the WhatsApp message to
    //             text: 'Hello, this is a test message from Infobip!' // Replace the text with your desired message content
    //         });

    //         req.write(postData);
    //         req.end();

    //     }

    //     // Call the function to send the WhatsApp message
    //     sendWhatsAppMessage(function (error, result) {
    //         if (error) {
    //             console.error('Error:', error);
    //         } else {
    //             console.log(result);
    //         }
    //     });

    // },

    whatsapp_message1: (request1, callback) => {

        const infobipApiKey = '4cc36af09901c59722b131aa30c3c21b-08af68e2-09c8-45af-96ff-570928730cfa';
        const baseUrl = 'https://api.infobip.com/whatsapp/1/send';

        const sendMessage = (phoneNumber, messageText, callback) => {
            const url = `${baseUrl}`;
            const headers = {
                'Authorization': `${infobipApiKey}`,
                'Accept': 'application/json'
            };

            const requestBody = {
                to: phoneNumber,
                from: 'InfoSMS',
                text: messageText,
            };
            console.log('url', url, 'requestBody', requestBody, 'headers', headers);
            axios.post(url, requestBody, { headers })
                .then((response) => {
                    // Invoke the callback with the response data
                    callback(null, response.data);
                })
                .catch((error) => {
                    // Invoke the callback with the error
                    callback(error);
                });
        };

        const recipientPhoneNumber = '918238403910'; // Replace with the recipient's phone number in international format
        const messageText = 'Your message hemang';

        sendMessage(recipientPhoneNumber, messageText, (error, responseData) => {
            if (error) {
                console.error('Error sending message:', error.message);
            } else {
                console.log('Message sent successfully:', responseData);
            }
        });


    },

    whatsapp_message: (request, callback) => {

        function sendWhatsAppMessage(callback) {
            const options = {
                method: 'POST',
                hostname: '2k5qmp.api.infobip.com',
                path: '/whatsapp/1/message/template',
                headers: {
                    'Authorization': '4cc36af09901c59722b131aa30c3c21b-08af68e2-09c8-45af-96ff-570928730cfa',
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                maxRedirects: 20
            };

            const req = https.request(options, function (res) {
                const chunks = [];

                res.on("data", function (chunk) {
                    chunks.push(chunk);
                });

                res.on("end", function () {
                    const body = Buffer.concat(chunks);
                    console.log(body.toString());
                });

                res.on("error", function (error) {
                    console.error(error);
                });
            });

            const postData = JSON.stringify({
                "messages": [
                    {
                        "from": "447860099299",
                        "to": "918238403910",
                        "content": {
                            "templateName": "template_name",
                            "templateData": {
                                "body": {
                                    "placeholders": [
                                        "Placeholder Value 1"
                                    ]
                                }
                            },
                            "language": "en_GB"
                        },
                        "callbackData": "Callback data",
                        "notifyUrl": "https://www.whatsapp.com/",
                        "messageId": "5bcffec3-8825-4e74-ae13-f19be6bcffeb",
                        "urlOptions": {
                            "shortenUrl": true,
                            "trackClicks": true,
                            "trackingUrl": "https://example.com/click-report",
                            "removeProtocol": true,
                            "customDomain": "https://www.whatsapp.com/"
                        },
                        "smsFailover": {
                            "from": "InfoSMS",
                            "text": "SMS message to be sent if WhatsApp template message could not be delivered"
                        }
                    }
                ]
            });

            req.write(postData);
            req.end();
        }

        sendWhatsAppMessage((response) => {
            // Handle the response here if needed
            console.log('API Response:', response);
        });
    },

    /*==================================================== 
       notification from vivek                                                                      
    ====================================================== */

    notification: (request, user_id, callback) => {

        var condition = ''
        if (request.page != "" && request.page != undefined) {
            condition = ` LIMIT ${request.limit},${request.per_page}`
        }
        var sql = `SELECT n.id as notification_id,n.reciver_type,n.image,n.title,n.message,n.tag FROM tbl_notification n
                    JOIN tbl_user u ON n.receiver_id = u.id
                    WHERE n.receiver_id = ${user_id}  ORDER BY n.id DESC ${condition}`

        con.query(sql, (error, result) => {
            // console.log(error);
            if (!error) {
                if (result.length > 0) {
                    con.query(`UPDATE tbl_notification SET ? WHERE receiver_id = '${user_id}'`, { is_read: '1' }, function (err1, result1) {
                        // console.log(err1);

                    })
                    asyncLoop(result, (item, next) => {
                        // console.log(result);
                        try {
                            item.message = JSON.parse(item.message)

                        } catch (e) {
                            item.message = item.message

                        }
                        if (item.tag == "admin_notification") {

                            item.title = t(`'${item.message.title}'`)
                            console.log('admin title', t(`'${item.message.title}'`))

                            item.body = t(`'${item.message.body}'`)
                            console.log('admin body', t(`'${item.message.body}'`));
                            return;

                            // item.title = item.message.title
                            // item.body = item.message.body
                            // delete item.current_language
                            // delete item.message
                            next()
                        }
                        //coupon_arrived
                        if (item.tag == "coupon_arrived") {

                            item.title = t(`'${item.message.title}'`)
                            console.log('coupon title', t(`'${item.message.title}'`))

                            item.body = t(`'${item.message.body}'`)
                            console.log('coupon body', t(`'${item.message.body}'`));
                            return;
                            next();
                        }
                        //cart_reminder
                        if (item.tag == "cart_reminder") {

                            item.title = t(`'${item.message.title}'`)
                            console.log('cart title', t(`'${item.message.title}'`))

                            item.body = t(`'${item.message.body}'`)
                            console.log('cart body', t(`'${item.message.body}'`));
                            return;
                            next();
                        }

                        else {
                            if (["coupon_arrived"].indexOf(item.tag) !== -1) {
                                // con.query(`SELECT b.order_id, CONCAT(u.first_name,' ',u.last_name) AS sp_name FROM tbl_booking AS b JOIN tbl_user AS u ON u.id = b.provider_id WHERE b.id = ${item.action_id} LIMIT 1`, (bErr, bResult) => {
                                //     console.log(bResult);
                                //     if (bResult[0]) {
                                //         console.log(bResult);
                                console.log(request.lang);
                                notification.getmessage(request.lang, item.message.title, (tranlated_message) => {
                                    item.title = t(`'${item.message.title}'`)
                                    console.log('fffff', tranlated_message);

                                    item.body = t(`'${item.message.body}'`);
                                    console.log('bbody', tranlated_message);
                                    return;
                                })


                                item.body = request.lang[item.current_language][item.message.body].replace('{order_id}', bResult[0].order_id).replace('{sp_name}', bResult[0].sp_name)
                                delete item.current_language
                                // }
                                //         delete item.message
                                next()

                                //     })
                            }
                            else {
                                // item.title = lang[item.current_language][item.message.title]
                                // item.body = lang[item.current_language][item.message.body]

                                // delete item.current_language
                                // delete item.message
                                next()
                            }
                        }
                    }, () => {
                        // resolve({ "page_token": parseInt(params.page_token) + 1, "result": result })
                        callback("1", { keywords: "success", content: {} }, result)

                    })
                    // let dataLists = {
                    //     'page': parseInt(request.page) + 1,
                    //     'page_count': result.length,
                    //     'result': (result.length != 0) ? result : [],
                    // }

                    callback("1", { keywords: "success", content: {} }, result)
                } else {
                    callback("2", { keywords: "data_not_found", content: {} }, {})
                }
            } else {
                callback("0", { keywords: "something_went_wrong", content: {} }, {})
            }
        })
    },

    getmessage: (language, message, callback) => {
        localizify
            .add('en', en)
            .add('ar', ar)
            .setLocale(language);

        callback(t(message, message));
    },

    //SEND NOTIFICATION
    // con.query(`SELECT current_language, CONCAT(first_name,' ',last_name) AS sp_name,mobile_number FROM tbl_user WHERE id = ${resAssignId} LIMIT 1`, (uErr, uResult) => {

    //     var push_data = {
    //         title: lang[uResult[0].current_language]['text_place_booking_title'].replace('{sp_name}', uResult[0].sp_name),
    //         body: lang[uResult[0].current_language]['text_place_booking_body'].replace('{order_id}', insertData.order_id),
    //         is_flag: 'p',
    //         custom: {
    //             tag: "place_booking",
    //             order_id: insertData.order_id,
    //             booking_id: result.insertId
    //         }
    //     }
    //     var push_notification = {
    //         sender_id: params.login_user_id,
    //         receiver_id: resAssignId,
    //         action_id: result.insertId,
    //         message: JSON.stringify({ title: 'text_place_booking_title', body: 'text_place_booking_body' }),
    //         tag: 'place_booking',
    //         is_flag: 'p',
    //         insert_datetime: moment().format("X")
    //     }
    //     common.prepare_notification(resAssignId, push_data);
    //     common.add_data('tbl_notification', push_notification, (res) => { });
    //     next();
    // });



    //////////////////////////////////////////////////////////////////////////////////////////
    /////                              Notification List                                 /////
    //////////////////////////////////////////////////////////////////////////////////////////

    notificationList: function (params) {
        let type = (params.type == "order_related") ? `AND tag != 'admin_notification'` : `AND tag = 'admin_notification'`
        return new Promise((resolve, reject) => {
            con.query({
                sql: `SELECT n.id, n.action_id, n.tag, n.message, n.is_read, n.insert_datetime, u.current_language FROM tbl_notification AS n 
                JOIN tbl_user AS u ON u.id = n.receiver_id 
                WHERE n.is_active = '1' AND n.receiver_id = '${params.login_user_id}' AND n.is_flag="c" AND n.tag NOT IN ('place_booking', 'booking_missed') ${type} ORDER BY n.id DESC LIMIT ${parseInt(params.page_token) * parseInt(GLOBALS.NOTIFICATION_PER_PAGE)},${GLOBALS.NOTIFICATION_PER_PAGE}`,
                typeCast: (field, next) => {
                    if (field.type == 'BLOB') {
                        return field.string()
                    }
                    return next()
                }
            }, function (err, result) {
                if (!err && result[0] != undefined) {
                    con.query(`UPDATE tbl_notification SET ? WHERE receiver_id = '${params.login_user_id}'`, { is_read: '1' }, function (err1, result1) {
                        console.log(err1);
                    })
                    asyncLoop(result, (item, next) => {
                        try {
                            item.message = JSON.parse(item.message)
                        } catch (e) {
                            item.message = item.message
                        }
                        if (item.tag == "admin_notification") {
                            item.title = item.message.title
                            item.body = item.message.body
                            delete item.current_language
                            delete item.message
                            next()
                        } else {
                            if (["booking_rejected", 'booking_rejected_by_cron', "booking_accepted", "booking_cancelled", "booking_started", "booking_reschedule", "booking_ended"].indexOf(item.tag) !== -1) {
                                con.query(`SELECT b.order_id, CONCAT(u.first_name,' ',u.last_name) AS sp_name FROM tbl_booking AS b JOIN tbl_user AS u ON u.id = b.provider_id WHERE b.id = ${item.action_id} LIMIT 1`, (bErr, bResult) => {
                                    console.log(bResult);
                                    if (bResult[0]) {
                                        console.log(bResult);
                                        // console.log(bResult);
                                        item.order_id = bResult[0].order_id
                                        item.title = lang[item.current_language][item.message.title].replace('{order_id}', bResult[0].order_id).replace('{sp_name}', bResult[0].sp_name)
                                        item.body = lang[item.current_language][item.message.body].replace('{order_id}', bResult[0].order_id).replace('{sp_name}', bResult[0].sp_name)
                                        delete item.current_language
                                    }
                                    delete item.message
                                    next()
                                })
                            } else if (["new_service_added"].indexOf(item.tag) !== -1) {
                                con.query(`SELECT CONCAT(first_name,' ',last_name) AS sp_name FROM tbl_user WHERE id = ${item.action_id} LIMIT 1`, (uErr, uResult) => {
                                    con.query(`SELECT name FROM tbl_category WHERE id = ${item.message.sub_category_id}`, (sErr, sResult) => {
                                        item.title = lang[item.current_language][item.message.title].replace('{sp_name}', uResult[0].sp_name)
                                        item.body = lang[item.current_language][item.message.body].replace('{service_name}', sResult[0].name)
                                        delete item.current_language
                                        delete item.message
                                        next()
                                    })
                                })
                            }
                            else if (["place_booking"].indexOf(item.tag) !== -1) {
                                con.query(`SELECT b.order_id, CONCAT(u.first_name,' ',u.last_name) AS sp_name FROM tbl_booking AS b JOIN tbl_user AS u ON u.id = b.user_id WHERE b.id = ${item.action_id} LIMIT 1`, (bErr, bResult) => {
                                    console.log("current lkanguage", item.current_language);
                                    item.order_id = bResult[0].order_id

                                    item.title = lang[item.current_language][item.message.title].replace('{sp_name}', bResult[0].sp_name)
                                    item.body = lang[item.current_language][item.message.body].replace('{order_id}', bResult[0].order_id)
                                    delete item.current_language
                                    delete item.message
                                    next()
                                })
                            }
                            else {
                                item.title = lang[item.current_language][item.message.title]
                                item.body = lang[item.current_language][item.message.body]

                                delete item.current_language
                                delete item.message
                                next()
                            }
                        }
                    }, () => {
                        resolve({ "page_token": parseInt(params.page_token) + 1, "result": result })
                    })
                } else {
                    reject(null)
                }
            })
        })
    },

    /*==================================================== 
        soket                                                                  
    ====================================================== */



}

module.exports = product;



