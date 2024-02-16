const connection = require('../../../config/database');

var chat_model = {

    send_message: (request, callback) => {

        chat_model.cheakMessage(request, (chatDetials) => {
            console.log(chatDetials);
            var value = {
                sender_id: request.sender_id,
                sender_type: 'user',
                receiver_id: request.receiver_id,
                receiver_type: 'admin',
                message: request.message,
                message_type: 'text',
                is_read: 'unread'
            }
            if (chatDetials != null) {

                value.chat_room_id = chatDetials.id
                connection.query('INSERT INTO tbl_chat SET ?', [value], (error, result) => {
                    if (!error) {
                        connection.query(`SELECT * FROM tbl_chat WHERE id = ${result.insertId} `, (error1, data_result) => {
                            if (!error1 && data_result.length > 0) {
                                callback('1', { keyword: "chat done", content: {} }, data_result[0]);
                            } else {
                                callback('0', { keyword: "chat not done", content: {} }, null);
                            }
                        });
                    } else {
                        console.log(error);
                        callback('0', { keyword: "chat not done", content: {} }, null);
                    }
                });

            } else {

                var chat_room = {
                    sender_id: request.sender_id,
                    sender_type: 'user',
                    reciver_id: request.receiver_id,
                    reciver_type: 'admin'
                }
                connection.query(`INSERT INTO tbl_chat_room SET ?`, [chat_room], (error, result1) => {
                    if (!error) {
                        value.chat_room_id = result1.insertId
                        console.log(value);
                        connection.query('INSERT INTO tbl_chat SET ?', [value], (error1, result2) => {
                            if (!error1) {

                                connection.query(`SELECT * FROM tbl_chat WHERE id = ${result2.insertId} `, (error1, data_result) => {
                                    if (!error1 && data_result.length > 0) {
                                        callback('1', { keyword: "chat done", content: {} }, data_result[0]);
                                    } else {
                                        callback('0', { keyword: "chat_not_done", content: {} }, null);
                                    }
                                });
                            } else {

                                console.log(error);
                                callback('0', { keyword: "chat_not_done", content: {} }, null);
                            }
                        });
                    } else {
                        console.log(error);
                        callback('0', { keyword: "chat_room_not_done", content: {} }, null);
                    }
                });
            }
        });
    },

    cheakMessage: (request, callback) => {

        var sql = `SELECT * FROM tbl_chat_room cr WHERE (cr.sender_id = '${request.sender_id}' AND cr.reciver_id = '${request.receiver_id}' ) OR (cr.reciver_id = '${request.sender_id}'  AND cr.sender_id = '${request.receiver_id}')`;

        connection.query(sql, (error, result) => {
            console.log(sql);
            if (!error && result.length > 0) {
                callback(result[0])
            } else {
                console.log(error);
                callback(null)
            }
        });
    },

    chatHistory: (request, callback) => {

        var sql = `SELECT c.id,c.chat_room_id,c.sender_id,(SELECT us.fullname FROM tbl_user us WHERE us.id = c.sender_id ) AS sender_name ,
        c.receiver_id,(SELECT us.fullname FROM tbl_user us WHERE us.id = c.receiver_id ) AS Reciver_name,c.message ,c.is_read
        FROM tbl_chat as c
        WHERE c.chat_room_id = ${request.chat_room_id} AND is_active = 1 AND is_delete = 0 ORDER BY c.id DESC`;
        connection.query(sql, (error, result) => {
            if (!error && result.length > 0) {

                chat_model.readchat(request, (is_true) => {

                    callback('1', { keyword: 'sucess', content: {} }, { chat_message: result })
                });
            } else {

                callback('0', { keyword: 'not sucess', content: {} }, {})
            }
        });
    },

    readchat: (request, callback) => {
        var sql = `UPDATE tbl_chat SET is_read = 'read' WHERE chat_room_id = ${request.chat_room_id} AND id = ${request.chat_id} AND receiver_id = ${request.user_id}`
        connection.query(sql, (error, result) => {
            if (!error && result.affectedrows > 0) {

                callback(true);
            } else {

                callback(false);
            }
        });
    },

    removeMessage: (request, callback) => {
        var sql = '';
        if (request.remove_type === 'me') {
            sql = `UPDATE tbl_chat SET is_delete = 1 WHERE id = ${request.chat_id} `;
        } else {
            sql = `UPDATE tbl_chat SET is_delete = 0 WHERE id = ${request.chat_id} `;
        }
        connection.query(sql, (error, result) => {
            if (!error) {
                chat_model.getMessage(request, (getChat) => {

                    callback('1', { keyword: 'sucess', content: {} }, { remove_chat: getChat })
                });
            } else {

                callback('0', { keyword: 'not found', content: {} }, {})
            }
        });
    },

    getMessage: (request, callback) => {
        var sql = `SELECT c.id,c.chat_room_id,c.sender_id,(SELECT us.fullname FROM tbl_user us WHERE us.id = c.sender_id ) AS sender_name ,
        c.receiver_id,(SELECT us.fullname FROM tbl_user us WHERE us.id = c.receiver_id ) AS Reciver_name,c.message ,c.is_read
        FROM tbl_chat as c
        WHERE id = '${request.chat_id}' ORDER BY c.id DESC LIMIT 1 `;

        connection.query(sql, (error, result) => {
            console.log(sql);
            if (!error && result.length > 0) {

                callback(result[0])
            } else {
                console.log(error);
                callback(null)
            }
        });
    },

    deleteChatHistory: (request, callback) => {
        var sql = `DELETE FROM tbl_chat_room WHERE id = ${request.chat_room_id}`

        connection.query(sql, (error, result) => {
            if (!error && result.affectedRows > 0) {

                var sql = `DELETE FROM tbl_chat WHERE chat_room_id = ${request.chat_room_id}`
                connection.query(sql, (error, result) => {
                    if (!error && result.affectedRows > 0) {

                        callback('1', { keyword: 'sucesss', content: {} }, result)
                    } else {

                        callback('0', { keycword: 'not sucess', content: {} }, {})
                    }
                });
            } else {

                callback('0', { keyword: 'not sucess', content: {} }, {})
            }
        });
    },

    getLastMessage11: (request, callback) => {

        var sql = `SELECT c.id,c.chat_room_id,c.sender_id,(SELECT us.fullname FROM tbl_user us WHERE us.id = c.sender_id ) AS sender_name ,
        c.receiver_id,(SELECT us.fullname FROM tbl_user us WHERE us.id = c.receiver_id ) AS Reciver_name,c.message ,c.is_read
        FROM tbl_chat as c
        WHERE chat_room_id = '${request.chat_room_id}' ORDER BY c.created_at DESC LIMIT 1`;
        connection.query(sql, (error, result) => {
            if (!error && result.length > 0) {

                callback('1', { keyword: 'sucesss', content: {} }, { LastMessage: result[0] })
            } else {

                callback('0', { keyword: 'not sucess', content: {} }, {})
            }
        });
    },

}
module.exports = chat_model;