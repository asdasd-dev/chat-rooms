const mongoose = require('mongoose');
const { Socket } = require('socket.io');

const Message = require('./message.model');
const User = require('./user.model');

const roomSchema = new mongoose.Schema({
    messages: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Message'
            }
        ],
        default: []
    },
    users: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        default: []
    }
})

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;