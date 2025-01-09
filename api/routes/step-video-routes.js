const express = require('express');
const router = express.Router();
const Step = require('../models/step');
const Task = require('../models/task');

// POST: Initiate video upload
router.post(
    '/:id/video',
    async (req, res) => {
        // User uploads a video
        // Create job to edit the video

        // TODO: Retrieve the video
        // Let's develop this while integrating it with the app to ensure it works

        const stepId = req.params.id;
        const videoURL = req.body.videoURL;

        if (!videoURL) {
            return res.status(400).send({ message: 'Video URL is required' });
        }

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
        
        const task = new Task({
            videoUrl: videoURL,
            stepId: stepId,
            editType: '360',
            status: 'Queued'
        })

        try {
            await task.save();
        }
        catch (error) {
            return res.status(500).send({ message: 'Error saving task' });
        }

        console.log("Success")

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

        let step;
        try {
            step = await Step.findById(stepId);
            if (!step) {
                return res.status(404).send({ message: 'Step not found' });
            }
        } catch (error) {
            return res.status(500).send({ message: 'Error getting step' });
        }

        return res.status(200).send({
            message: 'Video retrieved',
            videoURL: step.videoURL
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

        const stepId = req.params.id;

        let step;
        try {
            step = await Step.findById(stepId);
            if (!step) {
                return res.status(404).send({ message: 'Step not found' });
            }
        } catch (error) {
            return res.status(500).send({ message: 'Error getting step' });
        }

        if (!step.videoURL) {
            return res.status(400).send({ message: 'Video not uploaded' });
        }

        if (step.videoUploadStatus != "Done") {
            return res.status(400).send({ message: 'Video upload currently in progress.' });
        }
        
        const task = new Task({
            videoUrl: step.videoURL,
            stepId: stepId,
            editType: 'edit',
            editDescription: description,
            status: 'Queued'
        })

        try {
            await task.save();
        }
        catch (error) {
            console.error(error);
            return res.status(500).send({ message: 'Error saving task' });
        }


        return res.status(200).send({
            message: 'Description received'
        });
    }
);

module.exports = router;
