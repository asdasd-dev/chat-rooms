const mongoose = require('mongoose');

const Message = require('./message.model');
const Room = require('./room.model');

const userSchema = new mongoose.Schema({
    name: String,
    messages: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Message'
            }
        ],
        default: []
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
    },
    socketIds: [{
        type: [String],
        default: []
    }]
});

const User = mongoose.model("User", userSchema);

module.exports = User;