const express = require('express');
const router = express.Router();
const Model = require('./auth_model');
const Middleware = require('../../../middleware/validation');

/*==================================================== 
    singup                                                                              
====================================================== */
router.post('/signup', (req, res) => {

    Middleware.decryption(req.body, (request) => {
        var rules = {
            role: 'required',
            fullname: 'required',
            email: 'email|required',
            password: 'required',
            country_code: 'required',
            mobile_number: 'required',
            location: 'required',
            profile_image: '',
            about: 'nullable'
        }
        var messages = {
            required: 'please enter :attr',
        }
        if (Middleware.cheakValidation(request, res, rules, messages)) {

            Model.signUp(request, (responseCode, responseMsg, responseData) => {
                Middleware.response(req, res, responseCode, responseMsg, responseData);

            });
        }
    });
})

/*==================================================== 
    login                                                                              
====================================================== */
router.post('/login', (req, res) => {

    var request = req.body;

    Middleware.decryption(request, (request) => {

        var rules = {
            email: 'required',
            password: 'required'
        }
        var messages = {
            required: req.language.required,
        }
        if (Middleware.cheakValidation(request, res, rules, messages)) {

            Model.login(request, (responseCode, responseMsg, responseData) => {
                Middleware.response(req, res, responseCode, responseMsg, responseData);
            });
        }
    });
})

/*==================================================== 
    forgot password                                                                              
====================================================== */
router.post('/forgot_password', (req, res) => {

    var request = req.body;

    Middleware.decryption(request, (request) => {

        var rules = {
            email: 'required'
        }
        var messages = {
            required: req.language.required
        }
        if (Middleware.cheakValidation(request, res, rules, messages)) {

            Model.forgotPassword(request, (responseCode, responseMsg, responseData) => {

                Middleware.response(req, res, responseCode, responseMsg, responseData);
            });
        }
    });
})

/*==================================================== 
    reset password                                                                              
====================================================== */
router.post('/reset_password/:id', (req, res) => {

    var request = req.body;
    // Middleware.decryption(request, (request) => { 

    request.user_id = req.params.id;
    var rules = {
        password: 'required'
    }
    var messages = {
        required: req.language.required,
    }
    if (Middleware.cheakValidation(request, res, rules, messages)) {

        Model.resetPassword(request, res, (responseCode, responseMsg, responseData) => {

            Middleware.response(req, res, responseCode, responseMsg, responseData);
        });
    }
});
// })

/*==================================================== 
   logout                                                                              
====================================================== */
router.post('/logout', (req, res) => {

    var request = req.body;
    Middleware.decryption(request, (request) => {

        request.user_id = req.user_id

        Model.logout(request, (responseCode, responseMsg, responseData) => {
            Middleware.response(req, res, responseCode, responseMsg, responseData);
        });
    })
})

/* reset send link */
router.get('/resetfile/:id', (req, res) => {
    req.user_id = req.params.id;
    Model.getUserDetials(req, (userdetails) => {
        if (userdetails != null) {
            res.render('forgot.html', { result: userdetails.id });
        } else {
            Middleware.response_data(req, res, '0', 'errr', {});
        }
    })
});

module.exports = router;
