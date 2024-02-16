const express = require('express');
const router = express.Router();
const Model = require('./product_model');
const Middleware = require('../../../middleware/validation');
const Global = require('../../../config/constent');

/* soket io */

// const socketio = require('socket.io');
// const app = express();
// const io = socketio(server)

// --------------------------------------------------------------

router.post('/create_customer', (req, res) => {

    var request = req.body;

    Middleware.decryption(request, (request) => {

        request.user_id = req.user_id;
        var rules = {
            name: 'required',
            card_number: 'required',
            exp_month: 'required',
            exp_year: 'required',
            cvc: 'required',
            email: 'required'
        }
        var message = {
            required: 'please enter :attr'
        };
        if (Middleware.cheakValidation(request, res, rules, message)) {

            Model.createCustomer(request, (responsecode, responsemsg, responsedata) => {

                Middleware.response(req, res, responsecode, responsemsg, responsedata);
            });
        }
    });


});

router.post('/add_to_cart', (req, res) => {

    var request = req.body;
    request.user_id = req.user_id;

    Middleware.decryption(request, (request) => {

        var rules = {
        }
        var message = {
            required: 'please enter :attr'
        };

        if (Middleware.cheakValidation(request, res, rules, message)) {

            Model.createCardCustomer(request, (responsecode, responsemsg, responsedata) => {

                Middleware.response(req, res, responsecode, responsemsg, responsedata);
            });
        }
    });


});

router.post('/add_balance', (req, res) => {

    var request = req.body;
    request.user_id = req.user_id;

    Middleware.decryption(request, (request) => {

        var rules = {
        }
        var message = {
            required: 'please enter :attr'
        };

        if (Middleware.cheakValidation(request, res, rules, message)) {

            Model.addFundsToBalance(request, (responsecode, responsemsg, responsedata) => {

                Middleware.response(req, res, responsecode, responsemsg, responsedata);
            });
        }
    });


});

router.post('/get_customer', (req, res) => {

    var request = req.body;
    request.user_id = req.user_id;

    Middleware.decryption(request, (request) => {

        var rules = {
        }

        var message = {
            required: 'please enter :attr'
        };

        if (Middleware.cheakValidation(request, res, rules, message)) {

            Model.getAllCustomers(request, (responsecode, responsemsg, responsedata) => {

                Middleware.response(req, res, responsecode, responsemsg, responsedata);
            });
        }
    });


});

router.post('/add_bank_account', (req, res) => {

    var request = req.body;

    Middleware.decryption(request, (request) => {

        request.user_id = req.user_id;
        var rules = {
        }

        var message = {
            required: 'please enter :attr'
        };

        if (Middleware.cheakValidation(request, res, rules, message)) {

            Model.createAccount(request, (responsecode, responsemsg, responsedata) => {

                Middleware.response(req, res, responsecode, responsemsg, responsedata);
            });
        }
    });
});

router.post('/delete_customer', (req, res) => {

    var request = req.body;
    request.user_id = req.user_id;

    Middleware.decryption(request, (request) => {

        var rules = {
        }

        var message = {
            required: 'please enter :attr'
        };

        if (Middleware.cheakValidation(request, res, rules, message)) {

            Model.deleteCustomer(request, (responsecode, responsemsg, responsedata) => {

                Middleware.response(req, res, responsecode, responsemsg, responsedata);
            });
        }
    });

});

router.post('/sundayss', (req, res) => {

    var request = req.body;

    Middleware.decryption(request, (request) => {

        request.user_id = req.user_id
        var rules = {
        }
        var messages = {
            required: req.language.required,
        }
        if (Middleware.cheakValidation(request, res, rules, messages)) {

            Model.getAllSunday(request, (responseCode, responseMsg, responseData) => {

                Middleware.response(req, res, responseCode, responseMsg, responseData);
            });
        }
    });
})

router.post('/sundays', (req, res) => {
    const request = req.body;
    Middleware.decryption(request, (decryptedRequest) => {
        if (!decryptedRequest) {
            return res.status(400).json({ error: "Invalid request data" });
        }
        request.user_id = req.user_id;

        const rules = {};
        const messages = {
            required: req.language.required,
        };

        if (!Middleware.cheakValidation(decryptedRequest, res, rules, messages)) {
            return;
        }

        Model.getAllSunday(decryptedRequest, (responseCode, responseMsg, responseData) => {
            Middleware.response(req, res, responseCode, responseMsg, responseData);
        });
    });
});

router.post('/findnumber', (req, res) => {

    var request = req.body;

    Middleware.decryption(request, (request) => {

        request.user_id = req.user_id
        var rules = {
            // page: 'required'
        }
        var messages = {
            required: req.language.required,
        }
        if (Middleware.cheakValidation(request, res, rules, messages)) {

            // request.per_page = Global.PER_PAGE   
            // request.limit = ((request.page - 1) * request.per_page)
            Model.find_number(request, (responseCode, responseMsg, responseData) => {

                Middleware.response(req, res, responseCode, responseMsg, responseData);
            });
        }
    });
})

router.post('/whatsapp_notification', (req, res) => {

    Middleware.decryption(req.body, (request) => {

        request.user_id = req.user_id
        var rules = {
        }
        var messages = {
            required: req.language.required,
        }
        if (Middleware.cheakValidation(request, res, rules, messages)) {

            Model.whatsapp_message(request, (responseCode, responseMsg, responseData) => {
                Middleware.response(req, res, responseCode, responseMsg, responseData);
            });
        }
    });
})


module.exports = router;