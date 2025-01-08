const mongoose = require('mongoose');

const Step = mongoose.Schema({
    experienceId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "experiences"
    },
    name: {
        type: String,
        required: true
    },
    videoURL: String,
    videoUploadStatus: {
        type: String,
        enum: ['No video uploaded', 'Generating 360 degree video', 'Video editing in progress', 'Done'],
        default: 'No video uploaded'
    },
    positiveResponse: {
        type: String,
        required: true
    },
    neutralResponse: {
        type: String,
        required: true
    },
    negativeResponse: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('steps', Step);