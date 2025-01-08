const mongoose = require('mongoose');

const Experience = mongoose.Schema({
    name: String,
    playing: {
        type: Boolean,
        default: false
    },
    step: {
        type: Number,
        default: 0
    },
    stepIds: {
        type: [mongoose.Types.ObjectId],
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('experiences', Experience)