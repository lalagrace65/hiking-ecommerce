const mongoose = require('mongoose');
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); 
const { bcryptSalt } = require('../middleware/auth'); 
const { requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/create-staff', requireRole(['admin']), async(req, res) => {
    console.log('Received request:', req.body); 
    const { name, email, password, address, contactNo, role } = req.body;

    try {
        const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
        const userDoc = await User.create({
            name,
            email,
            password: hashedPassword,
            address,
            contactNo,
            role
        });

        console.log('Created user:', userDoc);
        res.json(userDoc);
    } catch (e) {
        console.error('Error creating staff:', e); 
        res.status(422).json(e);
    }
});

router.get('/create-staff', requireRole(['admin']), async (req, res) => {
    try {
        const getStaff = await User.find({ role: { $in: 'staff'} });
        res.json(getStaff);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching staff', error: error.message });
    }
});

router.put('/create-staff/:id', requireRole(['admin']), async (req, res) => {
    const { id } = req.params;
    const { name, email, oldPassword, newPassword, address, contactNo } = req.body;

    try {
        const updateData = { name, email, address, contactNo };

        // Find the staff member in the database
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'Staff not found' });
        }

        // If old password is provided, verify it
        if (oldPassword) {
            const isPasswordValid = bcrypt.compareSync(oldPassword, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ message: 'Old password is incorrect' });
            }

            // If old password is valid and new password is provided, hash the new password
            if (newPassword) {
                const hashedNewPassword = bcrypt.hashSync(newPassword, bcryptSalt);
                updateData.password = hashedNewPassword;
            }
        }

        // Update staff details
        const updatedStaff = await User.findByIdAndUpdate(id, updateData, { new: true });
        res.json(updatedStaff);
    } catch (err) {
        console.error('Error updating staff:', err);
        res.status(500).json({ message: 'Error updating staff', error: err.message });
    }
});



router.delete('/create-staff/:id', requireRole(['admin']), async (req, res) => {
    const { id } = req.params;

    try {
        console.log(`Attempting to delete staff with ID: ${id}`);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.log('Invalid staff ID format');
            return res.status(400).json({ message: 'Invalid staff ID format' });
        }

        const userDoc = await User.findById(id);

        if (!userDoc) {
            console.log('Staff not found');
            return res.status(404).json({ message: 'Staff not found' });
        }

        await User.findByIdAndDelete(id);

        console.log(`Staff with ID: ${id} deleted successfully`);
        res.json({ message: 'Staff deleted successfully' });
    } catch (err) {
        console.error('Error deleting staff:', err);
        res.status(500).json({ message: 'Error deleting staff', error: err.message });
    }
});


router.get('/admin-dashboard', requireRole('admin'), (req, res) => {
    res.json({ message: 'Welcome, Admin!' });
});

router.get('/staff-dashboard', requireRole(['admin','staff']), (req, res) => {
    res.json({ message: 'Welcome!' });
});

module.exports = router;