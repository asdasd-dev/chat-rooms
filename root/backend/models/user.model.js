const mongoose = require('mongoose');
const cryptoRandomString = require('crypto-random-string');


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
    }],
    token: {
        type: String,
        default: () => cryptoRandomString({length: 20, type: 'url-safe'})
    }
});

const User = mongoose.model("User", userSchema);

module.exports = User;