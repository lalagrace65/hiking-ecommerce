const mongoose = require('mongoose');
const express = require('express');
const jwt = require('jsonwebtoken');
const Package = require('../models/Package.js');
const { jwtSecret } = require('../middleware/auth');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// POST route to create a new package with the selected date
router.post('/packages', requireRole(['admin']), (req, res) => {
    console.log(req.body); // Log the incoming request body
    const { token } = req.cookies;
    const { packages, price, paymentOptions, extraInfo, checkIn, checkOut, maxGuests, date, timestamp } = req.body;

    // Check for required fields
    if (!date || !timestamp) {
        return res.status(400).json({ message: 'Date and timestamp are required' });
    }

    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) return res.status(403).json({ message: 'Unauthorized' });

        try {
            // Create a new package document in the database
            const packageDoc = await Package.create({
                travelAgency: userData.id,  // Extract travelAgency from the token (user data)
                packages,
                price,
                paymentOptions,
                extraInfo,
                checkIn,
                checkOut,
                maxGuests,
                date: new Date(date), 
                timestamp: new Date(timestamp) // Save the timestamp
            });

            res.status(201).json(packageDoc);
        } catch (error) {
            console.error('Error creating package:', error);
            res.status(500).json({ message: 'Error creating package', error: error.message });
        }
    });
});

// GET route to retrieve all packages
router.get('/packages', async (req, res) => {
    try {
        const packages = await Package.find(); // Find all packages
        res.json(packages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching packages', error: error.message });
    }
});

// GET route to retrieve a specific package by ID
router.get('/packages/:id', async (req, res) => {
    const { id } = req.params;
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid package ID format' });
        }

        const packageDoc = await Package.findById(id);
        if (!packageDoc) return res.status(404).json({ message: 'Package not found' });

        res.json(packageDoc);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching package', error: error.message });
    }
});

// PUT route to update a package by ID (accessible by staff and admin)
router.put('/packages/:id', requireRole(['admin', 'staff']), async (req, res) => {
    const { id } = req.params;
    const { token } = req.cookies;
    const { packages, price, paymentOptions, extraInfo, checkIn, checkOut, maxGuests } = req.body;

    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) return res.status(403).json({ message: 'Unauthorized' });

        try {
            const packageDoc = await Package.findById(id);
            if (!packageDoc) return res.status(404).json({ message: 'Package not found' });

            if (packageDoc.travelAgency.toString() !== userData.id) {
                return res.status(403).json({ message: 'You do not have permission to edit this package' });
            }

            packageDoc.packages = packages || packageDoc.packages;
            packageDoc.price = price || packageDoc.price;
            packageDoc.paymentOptions = paymentOptions || packageDoc.paymentOptions;
            packageDoc.extraInfo = extraInfo || packageDoc.extraInfo;
            packageDoc.checkIn = checkIn || packageDoc.checkIn;
            packageDoc.checkOut = checkOut || packageDoc.checkOut;
            packageDoc.maxGuests = maxGuests || packageDoc.maxGuests;

            await packageDoc.save();
            res.json(packageDoc);
        } catch (err) {
            res.status(500).json({ message: 'Error updating package', error: err.message });
        }
    });
});

// DELETE route to remove a package by ID (only accessible by admin)
router.delete('/packages/:id', requireRole(['admin']), async (req, res) => {
    const { id } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid package ID format' });
        }

        const packageDoc = await Package.findById(id);
        if (!packageDoc) return res.status(404).json({ message: 'Package not found' });

        await Package.findByIdAndDelete(id);
        res.json({ message: 'Package deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting package', error: err.message });
    }
});

module.exports = router;
