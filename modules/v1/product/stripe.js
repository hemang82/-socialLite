// var con         = require('./database');
var GLOBALS = require('../../../config/constent');
// var asyncLoop   = require('node-async-loop');
// var datetime    = require('node-datetime');

// Language file load
const { t } = require('localizify');

var https = require('https');

const fs = require('fs');

var path = require('path');

const stripe = require('stripe')(GLOBALS.STRIPE_SECRET_KEY);

// var data = require('../public/bank_document')

var Custom_stripe = {

    //get stripe errors
    geterrormessage: function (err, callback) {
        switch (err.type) {
            case 'StripeCardError':
                // A declined card error
                callback(err.message);
                break;
            case 'StripeRateLimitError':
                // Too many requests made to the API too quickly
                callback(err.message);
                break;
            case 'StripeInvalidRequestError':
                // Invalid parameters were supplied to Stripe's API
                callback(err.message);
                break;
            case 'StripeAPIError':
                // An error occurred internally with Stripe's API
                callback(err.message);
                break;
            case 'StripeConnectionError':
                // Some kind of error occurred during the HTTPS communication
                callback(err.message);
                break;
            case 'StripeAuthenticationError':
                // You probably used an incorrect API key
                callback(err.message);
                break;
            default:
                // Handle any other types of unexpected errors
                callback(t('restapi_globals_error'));
                break;
        }
    },

    //create card in stripe
    createcard: function (cardparam, callback) {
        stripe.tokens.create({
            card: {
                name: cardparam.cardholdername,
                number: cardparam.card_number,
                exp_month: cardparam.exp_month,
                exp_year: cardparam.exp_year,
                cvc: cardparam.cvv,
            },
        }, function (err, token) {
            // asynchronously called

            if (err) {
                Custom_stripe.geterrormessage(err, function (errMessage) {
                    callback(errMessage, null);
                });
            } else {
                callback(null, token);
            }
        });
    },

    //get card details from stripe
    getcarddetails: function (card_token, callback) {
        stripe.tokens.retrieve(card_token, function (err, token) {
            // asynchronously called
            if (err) {
                Custom_stripe.geterrormessage(err, function (errMessage) {
                    callback(errMessage, null);
                });
            } else {
                callback(null, token);
            }
        });
    },

    //create customer in stripe
    createcustomer: function (userparam, callback) {
        stripe.customers.create({
            source: userparam.card_token,
            name: userparam.name,
            email: userparam.email,
            phone: userparam.phone,
            description: GLOBALS.APP_NAME + " # User :- " + userparam.user_id
        }, function (err, customer) {
            // asynchronously called
            if (err) {
                Custom_stripe.geterrormessage(err, function (errMessage) {
                    callback(errMessage, null);
                });
            } else {
                callback(null, customer);
            }
        });
    },

    //update customer in stripe
    updatecustomer: function (customer_id, userparam, callback) {
        stripe.customers.update(customer_id, {
            name: userparam.name,
            email: userparam.email,
            phone: userparam.phone,
            description: globals.APP_NAME + " # User" + userparam.user_id
        }, function (err, customer) {
            // asynchronously called
            if (err) {
                Custom_stripe.geterrormessage(err, function (errMessage) {
                    callback(errMessage, null);
                });
            } else {
                callback(null, customer);
            }
        });
    },

    //get customer details from stripe
    getcustomerdetails: function (customer_id, callback) {
        stripe.customers.retrieve(customer_id, function (err, customer) {
            //asynchronously called
            if (err) {
                Custom_stripe.geterrormessage(err, function (errMessage) {
                    callback(errMessage, null);
                });
            } else {
                callback(null, customer);
            }
        });
    },

    //remove customer details from stripe
    deletecustomer: function (customer_id, callback) {
        stripe.customers.del(customer_id, function (err, confirmation) {
            //asynchronously called
            if (err) {
                Custom_stripe.geterrormessage(err, function (errMessage) {
                    callback(errMessage, null);
                });
            } else {
                callback(null, confirmation);
            }
        });
    },

    //get all customer from stripe
    getallcustomer: function (start, limit, callback) {
        if (start != null) {
            var param = { 'starting_after': start, 'limit': limit };
        } else {
            var param = { 'limit': limit };
        }
        stripe.customers.list(param, function (err, customers) {
            //asynchronously called
            if (err) {
                Custom_stripe.geterrormessage(err, function (errMessage) {
                    callback(errMessage, null);
                });
            } else {
                callback(null, customers);
            }
        });
    },

    //created card and customer in stripe
    addcard: function (cardparam, callback) {
        Custom_stripe.createcard(cardparam, function (errMessage, token) {
            // console.log();
            if (errMessage) {
                callback(errMessage, null);
            } else {
                cardparam.card_token = token.id;
                Custom_stripe.createcustomer(cardparam, function (errMessage, customer) {
                    if (errMessage) {
                        callback(errMessage, null);
                    } else {
                        var returnparam = {
                            'card_token': token.id,
                            'fingerprint': token.card.fingerprint,
                            'card_id': token.card.id,
                            'card_no': token.card.last4,
                            'card_type': token.card.brand,
                            'customer_id': customer.id,
                            'token_data': token,
                            'customer_data': customer,
                        }
                        callback(null, returnparam);
                    }
                });
            }
        });
    },

    //created Payment intent in stripe
    createpaymentintent: async function (request, callback) {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: parseInt((request.amount)),
            currency: request.currency,
            payment_method_types: ['card'],
        });
        callback(paymentIntent);
    },

    //get all account from stripe
    getallaccount(start, limit, callback) {
        if (start != null) {
            var param = { 'starting_after': start, 'limit': limit };
        } else {
            var param = { 'limit': limit };
        }
        stripe.accounts.list(param, function (err, accounts) {
            //asynchronously called
            if (err) {
                Custom_stripe.geterrormessage(err, function (errMessage) {
                    callback(errMessage, null);
                });
            } else {
                callback(null, accounts);
            }
        });
    },

    // file get contents
    file_get_contents: function (filerequest, callback) {

        // console.log();return;
        var request = https.get(GLOBALS.BANK_DOCUMENT_IMAGE + filerequest.bank_document, function (response) {
            // console.log(response);return;
            response.pipe(fs.createWriteStream(GLOBALS.BANK_DOCUMENT_IMAGE + filerequest.bank_document)).on('close', callback);
        });
    },

    /**
     * Function to upload users identity to stripe
     * 23-01-2020
     * @param {Request Data} request 
     * @param {Function} callback 
     */
    uploadidentitystripe(request, callback) {

        // console.log(path.join(__dirname, '../../'+GLOBALS.BANK_DOCUMENT_IMAGE + request.bank_document));return;
        // var fp = fs.readFileSync("../../" +GLOBALS.BANK_DOCUMENT_IMAGE + request.bank_document);
        var fp = fs.readFileSync(path.join(__dirname, '../../' + GLOBALS.BANK_DOCUMENT_IMAGE + request.bank_document));

        // console.log("hello",fp);return;
        var file = {};
        stripe.files.create({

            purpose: 'identity_document',
            file: {
                data: fp,
                name: request.bank_document,
                type: 'application/octet-stream'
                // type:'image/png'
            }
        }, function (errors, fileUpload) {

            if (errors) {
                Custom_stripe.geterrormessage(errors, function (errMessage) {

                    callback(errMessage, null);
                });
            } else {
                callback(null, fileUpload);
            }
        });
    },

    uploadAdditionalDoc(request, callback) {
        // console.log((path.join(__dirname, '../../' + GLOBALS.BANK_DOCUMENT_IMAGE + request.bank_document)));return;
        var fp = fs.readFileSync(path.join(__dirname, '../../' + GLOBALS.BANK_DOCUMENT_IMAGE + request.bank_document));
        var file = {};
        stripe.files.create({
            purpose: 'identity_document',
            file: {
                data: fp,
                name: request.additional_document,
                type: 'application/octet-stream'
            }
        }, function (errors, fileUpload) {
            if (errors) {
                callback(errMessage, null);
            } else {
                file = fileUpload;
                callback(null, fileUpload);
            }
        });
    },

    //Function to upload users identity to stripe
    // uploadidentitystripe: function (filerequest, callback) {
    //     /*Custom_stripe.file_get_contents(globals.BANK_DOCUMENT_IMAGE+request.bank_document,function(filedata){
    //         fs.writeFile('./public/bank_document/'+request.bank_document,filedata,function(err){
    //             if(err){
    //                 callback(err,null);
    //             } else {
    //                 var fp = fs.readFileSync('./public/bank_document/'+request.bank_document);
    //                 //var fp = fs.readFileSync(globals.BANK_DOCUMENT_IMAGE+request.bank_document);
    //                 stripe.files.create({
    //                     purpose: 'identity_document',
    //                     file: {
    //                         data: fp,
    //                         name: request.bank_document,
    //                         type: 'application/octet-stream'
    //                     }
    //                 }, function (errors, fileUpload) {
    //                     if (errors) {
    //                         Custom_stripe.geterrormessage(errors,function(errMessage){
    //                             callback(errMessage,null); 
    //                         });
    //                     } else {
    //                         callback(null,fileUpload);
    //                     }
    //                 }); 
    //             }
    //         });
    //     });*/

    //     // if (path.extname(filerequest.bank_document) == '.jpg' || path.extname(filerequest.bank_document) == '.jpeg') {
    //     //     var filetype = 'image/jpeg';
    //     // } else if (path.extname(filerequest.bank_document) == '.pdf') {
    //     //     var filetype = 'application/pdf';
    //     // } else {
    //     //     var filetype = 'image/png';
    //     // }
    //     // console.log(path.join(__dirname,'../../../public/bank_document'))
    //     // console.log("==================");
    //     // console.log(filetype);return
    //     // Custom_stripe.file_get_contents(filerequest, function (imgstatus) {
    //         //+
    //         // const fp = fs.readFileSync(GLOBALS.BANK_DOCUMENT_IMAGE + filerequest.bank_document);
    //         // const fp = fs.readFileSync(GLOBALS.BANK_DOCUMENT_IMAGE+filerequest.bank_document);
    //         var fp = fs.readFileSync("./API/public/bank_document/" + filerequest.bank_document);
    //         stripe.files.create({
    //             purpose: 'identity_document',
    //             file: {
    //                 data: fp,
    //                 name: filerequest.bank_document,
    //                 type: 'application/octet-stream'
    //             }
    //         }, function (errors, fileUpload) {
    //             if (errors) {
    //                 Custom_stripe.geterrormessage(errors, function (errMessage) {
    //                     callback(errMessage, null);
    //                 });
    //             } else {
    //                 callback(null, fileUpload);
    //             }
    //         });
    //     // });
    // },

    //Create an account in stripe

    createaccount: function (accparam, callback) {
        Custom_stripe.uploadidentitystripe(accparam, function (err, fileObject) {
            // console.log(fileObject);return;
            Custom_stripe.uploadAdditionalDoc(accparam, async function (err, additonalfileObject) {
                // console.log(additonalfileObject); return;
                if (err) {
                    callback(err, null);
                } else {
                    var dateOfBirth = accparam.dob.split("-");
                    var accountObject = {
                        type: 'custom',
                        country: accparam.sortname,
                        email: accparam.email,
                        business_type: 'individual',

                        requested_capabilities: ['card_payments', 'transfers'],
                        business_profile: {
                            mcc: '5411',
                            name: accparam.name,
                            url: "https://www.ggogle.com",
                            product_description: GLOBALS.APP_NAME,
                        },
                        individual: {
                            address: {
                                state: accparam.state_name,
                                city: accparam.city_name,
                                postal_code: accparam.pincode,
                                line1: accparam.address, //'address_full_match'
                                line2: ""
                            },
                            dob: {
                                day: dateOfBirth[2],
                                month: dateOfBirth[1],
                                year: dateOfBirth[0],
                            },
                            email: accparam.email,
                            first_name: accparam.first_name,
                            last_name: accparam.last_name,
                            phone: accparam.country_code + accparam.phone,
                            verification: {
                                additional_document: {
                                    front: additonalfileObject.id
                                },
                                document: {
                                    front: fileObject.id,
                                },
                            },
                        },

                        tos_acceptance: {
                            date: Math.floor(Date.now() / 1000),
                            ip: accparam.user_ip,
                        },
                        external_account: {
                            object: 'bank_account',
                            country: accparam.sortname,
                            bank_name: accparam.bank_name,
                            account_holder_name: accparam.account_holder_name,
                            account_number: accparam.account_number,
                            routing_number: accparam.routing_number,
                        },

                    };



                    if (accparam.sortname == 'US') {
                        accountObject.individual.ssn_last_4 = accparam.ssn_last;
                    }
                    // console.log(accountObject.individual); return;
                    await stripe.accounts.create(accountObject, function (err, account) {
                        //asynchronously called

                        if (err) {
                            Custom_stripe.geterrormessage(err, function (errMessage) {
                                console.log(errMessage);
                                callback(errMessage, null);
                            });
                        } else {
                            callback(null, account);
                        }
                    });
                }
            });
        });
    },

    //Update an account in stripe
    updateaccount: function (account_id, accparam, callback) {
        Custom_stripe.uploadidentitystripe(accparam, function (err, fileObject) {
            if (err) {
                callback(err, null);
            } else {
                var dateOfBirth = accparam.dob.split("-");
                var accountObject = {
                    type: 'custom',
                    country: accparam.sortname,
                    email: accparam.email,
                    business_type: 'individual',
                    requested_capabilities: ['card_payments', 'transfers'],
                    business_profile: {
                        mcc: '5411',
                        name: accparam.name,
                        url: "http://dityer.com/",
                        product_description: GLOBALS.APP_NAME,
                    },
                    individual: {
                        address: {
                            state: accparam.state_name,
                            city: accparam.city_name,
                            postal_code: accparam.pincode,
                            line1: accparam.address,//'address_full_match'
                        },
                        dob: {
                            day: dateOfBirth[2],
                            month: dateOfBirth[1],
                            year: dateOfBirth[0],
                        },
                        id_number: '000-000-000',
                        email: accparam.email,
                        first_name: accparam.first_name,
                        last_name: accparam.last_name,
                        phone: accparam.country_code + accparam.phone,
                        verification: {
                            document: {
                                front: fileObject.id
                            },
                            additional_document: {
                                front: fileObject.id
                            }
                        }
                    },
                    external_account: {
                        object: 'bank_account',
                        country: accparam.sortname,
                        currency: accparam.currency_code,
                        bank_name: accparam.bank_name,
                        account_holder_name: accparam.account_holder_name,
                        account_number: accparam.account_number,
                        routing_number: accparam.routing_number,
                    },
                    tos_acceptance: {
                        date: Math.floor(Date.now() / 1000),
                        ip: accparam.user_ip,
                    }
                };
                if (accparam.sortname == 'US') {
                    accountObject.individual.ssn_last_4 = accparam.ssn_last;

                }

                stripe.accounts.update(account_id, accountObject, function (err, account) {
                    //asynchronously called
                    if (err) {
                        Custom_stripe.geterrormessage(err, function (errMessage) {
                            callback(errMessage, null);
                        });
                    } else {
                        callback(null, account);
                    }
                });
            }
        });
    },

    //Get an account from stripe
    getaccountdetails: function (account_id, callback) {
        stripe.accounts.retrieve(account_id, function (err, account) {
            //asynchronously called
            if (err) {
                Custom_stripe.geterrormessage(err, function (errMessage) {
                    callback(errMessage, null);
                });
            } else {
                callback(null, account);
            }
        });
    },

    //delete an account from stripe
    deleteaccount: function (account_id, callback) {
        stripe.accounts.del(account_id, function (err, confirmation) {
            //asynchronously called
            if (err) {
                Custom_stripe.geterrormessage(err, function (errMessage) {
                    callback(errMessage, null);
                });
            } else {
                callback(null, confirmation);
            }
        });
    },

    /**
     * Function to create stripe charge [Note : if payment object contains capture parameter set to false than need to capture this charge]
     * @description This is not direct charge so transaction fees will be deducted from platform account [client account]
     * @param {Payment Object} paymentobject 
     * @param {Function} callback 
     */

    createcharge: function (payparam, callback) {
        if (payparam.account_id != undefined && payparam.account_id != "") {

            var payment = {
                amount: (Math.round(payparam.total_amount * 100)),
                currency: 'eur',
                capture: true,
                customer: payparam.customer_id,
                destination: payparam.account_id,
                application_fee_amount: Math.round(payparam.application_fee_amount * 100),
                description: "For Order: #" + payparam.order_no + " and to Store : " + payparam.store_name,
            };

        } else {
            var payment = {
                amount: (Math.round(payparam.total_amount * 100)),
                currency: 'eur',
                capture: true,
                customer: payparam.customer_id,
                description: "For Order: #" + payparam.order_no + " and to Store : " + payparam.store_name
            };

        }
        // console.log(payment);return;
        stripe.charges.create(payment, function (err, charge) {
            //asynchronously called

            if (err) {
                Custom_stripe.geterrormessage(err, function (errMessage) {
                    callback(errMessage, null);
                });
            } else {
                callback(null, charge);
            }
        });
    },

    //capture a charge
    capturecharge: function (charge_id, callback) {
        stripe.charges.capture(charge_id, function (err, charge) {
            if (!err) {
                Custom_stripe.getchargedetails(charge_id, function (err, charge_details) {
                    if (err) {
                        Custom_stripe.geterrormessage(err, function (errMessage) {
                            callback(errMessage, null);
                        });
                    } else {
                        callback(null, charge_details);
                    }
                })
            } else {
                Custom_stripe.geterrormessage(err, function (errMessage) {
                    callback(errMessage, null);
                });
            }

            //asynchronously called

        });
    },

    //get charge details from stripe
    getchargedetails: function (charge_id, callback) {
        stripe.charges.retrieve(charge_id, function (err, charge) {
            //asynchronously called
            if (err) {
                Custom_stripe.geterrormessage(err, function (errMessage) {
                    callback(errMessage, null);
                });
            } else {
                callback(null, charge);
            }
        });
    },

    //get all charge from stripe
    getallcharge(start, limit, callback) {
        if (start != null) {
            var param = { 'starting_after': start, 'limit': limit };
        } else {
            var param = { 'limit': limit };
        }
        stripe.charges.list(param, function (err, charges) {
            //asynchronously called
            if (err) {
                Custom_stripe.geterrormessage(err, function (errMessage) {
                    callback(errMessage, null);
                });
            } else {
                callback(null, charges);
            }
        });
    },

    //refund stripe charge
    refundcharge: function (charge_id, payment_type, refund_amount, order_no, store_name, callback) {
        if (payment_type == "card") {
            var refundparam = { charge: charge_id };
        }
        else {
            var refundparam = { payment_intent: charge_id };
        }


        if (parseFloat(refund_amount) > 0) {
            refundparam.amount = (refund_amount * 100);
        }
        refundparam.metadata = {
            "description": "Refund for Order # " + order_no,
            "reason": "Customer requested a refund",
            "notes": "Order placed to store : " + store_name

        }
        // refundparam.reason="Cancel Order by Customer Order # :"+order_no+" Store : "+store_name;
        stripe.refunds.create(refundparam, function (err, refund) {
            //asynchronously called
            if (err) {
                Custom_stripe.geterrormessage(err, function (errMessage) {
                    console.log(errMessage);
                    callback(errMessage, null);
                });
            } else {
                callback(null, refund);
            }
        });
    },

    //get refund details from stripe
    getrefunddetails: function (refund_id, callback) {
        stripe.refunds.retrieve(refund_id, function (err, refund) {
            // asynchronously called
            if (err) {
                Custom_stripe.geterrormessage(err, function (errMessage) {
                    callback(errMessage, null);
                });
            } else {
                callback(null, refund);
            }
        });
    },

    //get all refund from stripe
    getallrefund(start, limit, callback) {
        if (start != null) {
            var param = { 'starting_after': start, 'limit': limit };
        } else {
            var param = { 'limit': limit };
        }
        stripe.refunds.list(param, function (err, refunds) {
            //asynchronously called
            if (err) {
                Custom_stripe.geterrormessage(err, function (errMessage) {
                    callback(errMessage, null);
                });
            } else {
                callback(null, refunds);
            }
        });
    },

    //transfer the amount to diffrent stripe account
    Transfer: function (payparam, callback) {
        var transfer_data = {
            amount: (payparam.total_amount) * 100,
            currency: "usd",
            source_transaction: payparam.charge_id,   // charge id 
            destination: payparam.account_id,
        }

        stripe.transfers.create(transfer_data, function (err, data) {
            if (err) {
                Custom_stripe.geterrormessage(err, function (errMessage) {
                    callback(errMessage, null);
                });
            } else {
                callback(null, data);
            }
        })
    },


    stripeAccount: async (request, user_id, callback) => {
        // CREATE CONNECTED ACCOUNT
        const { mobile } = request.query
        const account = await stripe.accounts.create({
            type: "express",
        })
        const accountLinks = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: `${GLOBALS.BASE_URL_WITHOUT_API}api/stripe/account/reauth?account_id=${account.id}`,
            return_url: `${GLOBALS.BASE_URL_WITHOUT_API}vendor_stripe_register${mobile ? "-mobile" : ""}?user_id=${user_id}?account_id=${account.id
                }&result=success`,
            type: "account_onboarding",
        })

        // const accountLinks = await stripe.accountLinks.create({
        //     account: account.id,
        //     refresh_url: account.refresh_url,
        //     return_url: `${GLOBALS.BASE_URL_WITHOUT_API}vendor_stripe_register${mobile ? "-mobile" : ""}?user_id=${user_id}?account_id=${account.id}&result=success`,
        //     type: "account_onboarding",
        // })
        if (mobile) {
            // In case of request generated from the flutter app, return a json response
            callback({ success: true, url: accountLinks.url })
        }
        else {
            // In case of request generated from the web app, redirect
            callback(accountLinks.url)
        }
    },



};

module.exports = Custom_stripe;