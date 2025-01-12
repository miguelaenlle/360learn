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
        enum: ['No video uploaded', 'Generating 360 degree video', 'Video is processing', 'Video processed'],
        default: 'No video uploaded'
    },
    stepType: {
        type: String,
        enum: [
            "Instruction", "Response"
        ],
        default: "Instruction"
    },
    instructionCC: {
        type: String,
        required: true
    },
    responseCC: {
        type: String,
    },  
    positiveResponse: {
        type: String,
    },
    neutralResponse: {
        type: String,
    },
    negativeResponse: {
        type: String,
    }
})

module.exports = mongoose.model('steps', Step);