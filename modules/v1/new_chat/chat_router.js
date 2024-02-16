const express = require('express');
const router = express.Router();
const chat_model = require('./chat_model');
const middleware = require('../../../middleware/validation');
const Global = require('../../../config/constent');


router.post('/send_message', (req, res) => {
    console.log('========');
    // middleware.decryption(req, (request) => {

    var request = req.body;
    request.user_id = req.user_id
    var rules = {
        sender_id: 'required',
        receiver_id: 'required',
        message: 'required'
    }
    var messages = {
        required: req.language.required
    }
    if (middleware.cheakValidation(request, res, rules, messages)) {

        chat_model.send_message(request, (responseCode, responseMsg, responseData) => {
            middleware.response(req, res, responseCode, responseMsg, responseData);
        });
    }
    // });
})

router.post('/chat_lisening', (req, res) => {

    // middleware.decryption(req.body, (request) => {
    var request = req.body
    request.user_id = req.user_id
    var rules = {
        page: '',
        chat_room_id: 'required'
    }
    var messages = {
        required: req.language.required,
    }
    if (middleware.cheakValidation(request, res, rules, messages)) {

        request.per_page = Global.PER_PAGE
        request.limit = ((request.page - 1) * request.per_page)

        chat_model.chatHistory(request, (responseCode, responseMsg, responseData) => {

            middleware.response(req, res, responseCode, responseMsg, responseData);
        });
    }
    // });
})

router.post('/remove_chat', (req, res) => {

    var request = req.body;

    // middleware.decryption(request, (request) => {

    request.user_id = req.user_id
    var rules = {
        chat_id: 'required',
        remove_type: 'required'
    }
    var messages = {
        required: req.language.required,
    }
    if (middleware.cheakValidation(request, res, rules, messages)) {

        chat_model.removeMessage(request, (responseCode, responseMsg, responseData) => {
            middleware.response(req, res, responseCode, responseMsg, responseData);
        });
    }
    // });
})

router.post('/delete_chatHistory', (req, res) => {

    var request = req.body;

    // Middleware.decryption(request, (request) => {

    request.user_id = req.user_id
    var rules = {
        chat_room_id: 'required'
    }
    var messages = {
        required: req.language.required,
    }
    if (middleware.cheakValidation(request, res, rules, messages)) {
        chat_model.deleteChatHistory(request, (responseCode, responseMsg, responseData) => {
            middleware.response(req, res, responseCode, responseMsg, responseData);
        });
    }
    // });
})

router.post('/get_lastmessage', (req, res) => {


    // Middleware.decryption(request, (request) => {
    var request = req.body;

    request.user_id = req.user_id
    var rules = {
        // chat_room_id: 'required'
    }
    var messages = {
        required: req.language.required,
    }
    if (middleware.cheakValidation(request, res, rules, messages)) {
        chat_model.getLastMessage(request, (responseCode, responseMsg, responseData) => {
            middleware.response(req, res, responseCode, responseMsg, responseData);
        });
    }
    // });
})

module.exports = router;