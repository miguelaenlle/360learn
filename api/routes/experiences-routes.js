const express = require('express');
const Experience = require('../models/experience');
const router = express.Router();

// POST: Create a new experience
router.post(
    '/',
    async (req, res) => {
        const { name } = req.body;
        if (!name) {
            return res.status(400).send({ message: 'Name is required' });
        }
    
        const experience = new Experience({ name });

        try {    
            await experience.save();
            return res.status(201).send({
                message: 'Experience created',
                experience: {
                    ...experience.toObject(),
                    createdAt: experience.createdAt.getTime() / 1000
                }
            });
        } catch (error) {
            console.error('Error creating experience:', error);
            return res.status(500).send({ message: 'Error creating experience' });
        }
    }
);

// GET all experiences
router.get(
    '/',
    async (req, res) => {
        try {
            let experiences = await Experience.find();
            experiences = experiences.map(experience => ({
                ...experience.toObject(),
                createdAt: experience.createdAt.getTime() / 1000
            }))
            return res.status(200).send({ experiences });
        } catch (error) {
            console.error('Error getting experiences:', error);
            return res.status(500).send({ message: 'Error getting experiences' });
        }
    }
);

// GET one experience by ID
router.get(
    '/:id',
    async (req, res) => {
        const { id } = req.params;
        try {
            const experience = await Experience.findById(id);
            if (!experience) {
                return res.status(404).send({ message: 'Experience not found' });
            }
            return res.status(200).send({ experience });
        } catch (error) {
            console.error(`Error getting experience with id ${id}:`, error);
            return res.status(500).send({ message: 'Error getting experience' });
        }
    }
);

// PUT: Update an experience
router.put(
    '/:id',
    async (req, res) => {
        const { id } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).send({ message: 'Name is required' });
        }

        try {
            const experience = await Experience.findByIdAndUpdate(
                id, 
                { name },
                { new: true }
            );

            if (!experience) {
                return res.status(404).send({ message: 'Experience not found' });
            }

            return res.status(200).send({
                message: 'Experience updated',
                experience
            });
        } catch (error) {
            console.error(`Error updating experience with id ${id}:`, error);
            return res.status(500).send({ message: 'Error updating experience' });
        }
    }
);

// DELETE: Remove an experience
router.delete(
    '/:id',
    async (req, res) => {
        const { id } = req.params;
        try {
            const experience = await Experience.findByIdAndDelete(id);
            if (!experience) {
                return res.status(404).send({ message: 'Experience not found' });
            }
            return res.status(200).send({ message: 'Experience deleted' });
        } catch (error) {
            console.error(`Error deleting experience with id ${id}:`, error);
            return res.status(500).send({ message: 'Error deleting experience' });
        }
    }
);

module.exports = router;
