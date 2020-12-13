const mongoose = require('mongoose');
const cryptoRandomString = require('crypto-random-string');

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
    },
    token: {
        type: String,
        default: () => cryptoRandomString({length: 20, type: 'url-safe'})
    }
})

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;