const mongoose = require('mongoose');

const Task = mongoose.Schema({
    videoUrl: {
        type: String,
        required: true
    },
    stepId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "steps"
    },
    editType: {
        type: String,
        enum: ['360', 'edit'], // Convert to a 360 degree video or edit the video
        required: true
    },
    editDescription: {
        type: String,
        d: false
    },
    status: {
        type: String,
        enum: ['Queued', 'In progress', 'Done'],
        default: 'Queued'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('tasks', Task);