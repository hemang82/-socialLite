const express = require('express');
const app = express();
const router = express.Router();
require('dotenv').config();
const port = process.env.PORT || '2307';
const middleware = require('./middleware/validation')

/* soket */

// const socketio = require('socket.io');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

/* default files  */
app.use('/', require('./middleware/validation').extrectHeaderLanguage);
app.use('/', require('./middleware/validation').validateApiKey);
app.use('/', require('./middleware/validation').validateToken);

/* Routers  */
app.use('/api/v1/auth', require('./modules/v1/auth/auth_router'));
app.use('/api/v1/product', require('./modules/v1/product/product_router'));
app.use('/api/v1/chat', require('./modules/v1/amarjit_chat/chat_router'));

const chat_model = require('./modules/v1/amarjit_chat/chat_model');
const { request } = require('https');
/* Server  */
try {

    let server = app.listen(port, () => {
        console.log(` * ========= server start ${port} ========= *`);
        const io = require('socket.io')(server, {
            cors: {
                origin: '*',
            }
        })

        var users = {};

        const sock = io.of('/socket').on('connection', (socket) => {
            let user_id = socket.handshake.query.user_id

            users[user_id] = {
                socket: socket.id,
            };
            console.log('users connected........', users)

            socket.on('send_message', (req, res) => {

                middleware.decryption(req, (request) => {

                    request.sender_id = user_id;
                    var receiver_id = request.receiver_id;

                    chat_model.send_message(request, (code, message, data) => {
                        if (data != null) {

                            if (users[receiver_id] != undefined) {

                                var responseData = { code: code, message: message, data: data }
                                middleware.encryption(responseData, (response) => {
                                    sock.to(users[user_id]['socket']).emit('send_message', response);
                                    sock.to(users[receiver_id]['socket']).emit('send_message', response);
                                });
                            } else {

                                //push notification hear....

                                var responseData = { code: code, message: message, data: data }
                                middleware.encryption(responseData, (response) => {
                                    socket.to(users[user_id]['socket']).emit('send_message', response)
                                })
                            }
                        } else {

                            let response_data = { code: code, message: message, data: data }
                            middleware.encryption(response_data, (response) => {
                                socket.to(users[user_id]['socket']).emit('send_message', response)
                            })
                        }
                    })
                });
            });

            socket.on('typing', (req, res) => {
                middleware.decryption(req, (request) => {
                    if (user_id != '' && user_id != undefined) {

                        if (request.is_typing == '1') {

                            var response = {
                                user_id: request.user_id,
                                is_typing: request.is_typing,
                            };

                            var responseData = { code: '1', message: 'Typing...', data: response };
                            middleware.encryption(responseData, (response) => {
                                console.log('typing__',);
                                socket.to(users[request.receiver_id]['socket']).emit('typing', response)
                            })
                        } else {

                            var responseData = { code: '0', message: '', data: {} };
                            middleware.encryption(responseData, (response) => {
                                socket.to(users[request.receiver_id]['socket']).emit('typing', response)
                            });
                        }
                    } else {

                        var responseData = { code: '0', message: 'Invalid request', data: {} };
                        middleware.encryption(responseData, (response) => {
                            socket.to(users[request.receiver_id]['socket']).emit('typing', response)
                        });
                    }
                });
            });

            socket.on('disconnect', () => {
                for (var user_id in users) {
                    if (users[user_id].socket === socket.id) {
                        delete users[user_id];
                        console.log('disconnected user_id', user_id);
                        break;
                    }
                }
            });

        })

    });
} catch (error) {

    console.log(error);
}


// push notification
// var sender_type = request.sender_type;
// var receiver_type = request.receiver_type;
// var push_message = {
//     title: "New message",
//     message: `${data[0].sender_name} Sent You message `,
//     action_id: data[0].chat_room_id,
//     notification_tag: 'new_message',
// }
// const push_data = {

//     alert: { title: "new_chat", body: push_message.message },
//     custom: {
//         title: "New message",
//         body: push_message.message,
//         message: push_message,
//         action_id: data[0].booking_id,
//         notification_tag: 'new_message',
//     },
//     topic: process.env.BUNDLE_ID,
//     priority: 'high'
// };
// var notification_params = {
//     add_notification: 'Yes',
//     action_id: data[0].booking_id,
//     sender_id: data[0].sender_id,
//     receiver_id: data[0].receiver_id,
//     notification_tag: 'new_message',
//     message: push_message.message,
//     sender_type: sender_type,
//     title: "New message",
//     receiver_type: receiver_type,
//     status: "new_message",
// };
// common.send_notification(push_data, notification_params);

