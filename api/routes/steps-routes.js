const express = require('express');
const router = express.Router();

const Step = require('../models/step');
const Experience = require('../models/experience');

// POST: Create a new step
router.post(
    '/',
    async (req, res) => {
        if (!req.body.experienceId) {
            return res.status(400).send({ message: 'Experience ID is required' });
        }

        if (!req.body.name) {
            return res.status(400).send({ message: 'Name is required' });
        }

        if (!req.body.positiveResponse) {
            return res.status(400).send({ message: 'Positive response is required' });
        }

        if (!req.body.neutralResponse) {
            return res.status(400).send({ message: 'Neutral response is required' });
        }

        if (!req.body.negativeResponse) {
            return res.status(400).send({ message: 'Negative response is required' });
        }

        const step = new Step({
            experienceId: req.body.experienceId,
            name: req.body.name,
            positiveResponse: req.body.positiveResponse,
            neutralResponse: req.body.neutralResponse,
            negativeResponse: req.body.negativeResponse
        });

        try {
            await step.save();
        } catch {
            return res.status(500).send({ message: 'Error creating step' });
        }

        try {
            await Experience.findByIdAndUpdate(
                req.body.experienceId,
                {
                    $push: {
                        stepIds: step._id
                    }
                }
            );
        } catch {
            return res.status(500).send({ message: 'Error updating experience' });
        }

        return res.status(201).send({
            message: 'Step created',
            step
        });
    }
);

// GET: Retrieve steps by experienceId
router.get(
    '/',
    async (req, res) => {
        if (!req.query.experienceId) {
            return res.status(400).send({ message: 'Experience ID is required' });
        }

        try {
            const steps = await Step.find({
                experienceId: req.query.experienceId
            });

            return res.status(200).send({ steps });
        } catch {
            return res.status(500).send({ message: 'Error getting steps' });
        }
    }
);

// GET one step (by ID or step number)
router.get(
    '/:id', // this is either an ID or a step number
    async (req, res) => {
        const isId = req.params.id.length === 24;

        let step;
        if (isId) {
            try {
                step = await Step.findById(req.params.id);
            } catch {
                return res.status(500).send({ message: 'Error getting step' });
            }
        } else {
            try {
                const idAsNumber = parseInt(req.params.id);
                if (isNaN(idAsNumber)) {
                    return res.status(400).send({ message: 'Invalid step number' });
                }

                if (!req.query.experienceId) {
                    return res.status(400).send({ message: 'Experience ID is required' });
                }

                const experience = await Experience.findById(req.query.experienceId);

                if (!experience) {
                    return res.status(404).send({ message: 'Experience not found' });
                }

                const stepId = experience.stepIds[idAsNumber];

                if (!stepId) {
                    return res.status(404).send({ message: 'Step not found' });
                }

                step = await Step.findById(stepId);

                if (!step) {
                    return res.status(404).send({ message: 'Step not found' });
                }
            } catch {
                return res.status(500).send({ message: 'Error getting step' });
            }
        }
        return res.status(200).send({ step });
    }
);

// PUT: Update a step (by ID or step number)
router.put(
    '/:id', // this is either an ID or a step number
    async (req, res) => {

        if (!req.body.name) {
            return res.status(400).send({ message: 'Name is required' });
        }

        if (!req.body.positiveResponse) {
            return res.status(400).send({ message: 'Positive response is required' });
        }

        if (!req.body.neutralResponse) {
            return res.status(400).send({ message: 'Neutral response is required' });
        }

        if (!req.body.negativeResponse) {
            return res.status(400).send({ message: 'Negative response is required' });
        }
        
        const isId = req.params.id.length === 24;

        let step;
        if (isId) {
            try {
                step = await Step.findById(req.params.id);
            } catch {
                return res.status(500).send({ message: 'Error getting step' });
            }
        } else {
            try {
                const idAsNumber = parseInt(req.params.id);
                if (isNaN(idAsNumber)) {
                    return res.status(400).send({ message: 'Invalid step number' });
                }

                if (!req.query.experienceId) {
                    return res.status(400).send({ message: 'Experience ID is required' });
                }

                const experience = await Experience.findById(req.query.experienceId);

                if (!experience) {
                    return res.status(404).send({ message: 'Experience not found' });
                }

                const stepId = experience.stepIds[idAsNumber];

                if (!stepId) {
                    return res.status(404).send({ message: 'Step not found' });
                }

                step = await Step.findById(stepId);

                if (!step) {
                    return res.status(404).send({ message: 'Step not found' });
                }
            } catch {
                return res.status(500).send({ message: 'Error getting step' });
            }
        }

        step.name = req.body.name;
        step.negativeResponse = req.body.negativeResponse;
        step.positiveResponse = req.body.positiveResponse;
        step.neutralResponse = req.body.neutralResponse;

        try {
            await step.save();
        } catch {
            return res.status(500).send({ message: 'Error updating step' });
        }
        
        return res.status(200).send({ step });
    }
);

// DELETE: Remove a step
router.delete(
    '/:id',
    async (req, res) => {
        let step;
        try {
            step = await Step.findById(req.params.id);
        } catch {
            return res.status(500).send({ message: 'Error getting step' });
        }

        try {
            await Experience.findByIdAndUpdate(
                step.experienceId,
                {
                    $pull: {
                        stepIds: step._id
                    }
                }
            );
            await Step.deleteOne({ _id: step._id });
        } catch {
            return res.status(500).send({ message: 'Error deleting step' });
        }

        return res.status(200).send({ message: 'Step deleted' });
    }
);

// Video routes
const stepVideoRoutes = require('./step-video-routes');
router.use('/', stepVideoRoutes);

module.exports = router;
