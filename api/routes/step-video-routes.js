const express = require('express');
const router = express.Router();
const Step = require('../models/step');

// POST: Initiate video upload
router.post(
    '/:id/video',
    async (req, res) => {
        // User uploads a video
        // Create job to edit the video

        // TODO: Retrieve the video
        // Let's develop this while integrating it with the app to ensure it works

        const stepId = req.params.id;

        // Update the video status
        try {
            await Step.findByIdAndUpdate(    
                stepId,
                {
                    videoUploadStatus: 'Generating 360 degree video'
                }
            );
        } catch (error) {
            return res.status(500).send({ message: 'Error updating step' });
        }

        // Wait 1 second
        await new Promise(resolve => setTimeout(resolve, 1000));
        // TODO: Upload the video
        // TODO: Edit the video
        // (the GPU workstation will do this as soon as it receives a task)

        return res.status(200).send({
            message: 'Video upload initiated'
        });
    }
);

// GET: Retrieve video
router.get(
    '/:id/video',
    async (req, res) => {
        const stepId = req.params.id;

        // TODO: Retrieve the video
        await new Promise(resolve => setTimeout(resolve, 1000));

        return res.status(200).send({
            message: 'Video retrieved',
            url: 'https://example.com'
        });
    }
);

// GET: Video status
router.get(
    '/:id/video/status',
    async (req, res) => {  // Marked as async
        const stepId = req.params.id;

        try {
            // Await the database call
            const step = await Step.findById(stepId).select('videoUploadStatus');
            if (!step) {
                return res.status(404).send({ message: 'Step not found' });
            }
            return res.status(200).send({
                message: 'Video status retrieved',
                status: step.videoUploadStatus
            });
        } catch (error) {
            return res.status(500).send({ message: 'Error getting step' });
        }
    }
);

// PUT: Receive video description
router.put(
    '/:id/video',
    async (req, res) => {
        const description = req.body.description;
        if (!description) {
            return res.status(400).send({ message: 'Description is required' });
        }

        // TODO: Edit the video with RAVE
        await new Promise(resolve => setTimeout(resolve, 1000));

        return res.status(200).send({
            message: 'Description received'
        });
    }
);

module.exports = router;
