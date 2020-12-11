const mongoose = require('mongoose');
const { Socket } = require('socket.io');
const User = require('./user.model');

const messageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    date: {
        type: Date,
        default: Date.now
    },
    content: String
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;