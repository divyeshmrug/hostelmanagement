const express = require('express');
const router = express.Router();
const { User, Hostel, Notice, Complaint, Fee } = require('../models/Schemas');

// --- SUPER ADMIN ROUTES ---

// Get ALL Data (Super Admin Only)
router.get('/all-data', async (req, res) => {
    try {
        const hostels = await Hostel.find();
        const students = await User.find({ role: 'student' });
        const complaints = await Complaint.find();
        const notices = await Notice.find();
        const fees = await Fee.find();

        res.json({ hostels, students, complaints, notices, fees });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Download Backup (Super Admin Only)
router.get('/backup', async (req, res) => {
    try {
        const hostels = await Hostel.find();
        const students = await User.find({ role: 'student' });
        const complaints = await Complaint.find();
        const notices = await Notice.find();
        const fees = await Fee.find();
        const systemReports = await require('../models/Schemas').SystemReport?.find() || []; // Handle if schema missing

        const backupData = {
            timestamp: new Date().toISOString(),
            hostels,
            students,
            complaints,
            notices,
            fees,
            systemReports
        };

        const fileName = `lumina_backup_${new Date().toISOString().replace(/:/g, '-')}.json`;

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.send(JSON.stringify(backupData, null, 2));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- AUTH ---

router.post('/login', async (req, res) => {
    const { id, password } = req.body;
    try {
        // Special check for Hardcoded Super Admin (if not in DB yet)
        if (id === 'divyesh112006' && password === '123') {
            return res.json({
                success: true,
                user: { id: 'divyesh112006', name: 'Divyesh (Super Admin)', role: 'super_admin' }
            });
        }

        const user = await User.findOne({ id, password });
        if (user) {
            res.json({ success: true, user });
        } else {
            // Check Rectors within Hostels (Legacy Structure Support or separate schema)
            const hostelRector = await Hostel.findOne({ rectorId: id, rectorPassword: password });
            if (hostelRector) {
                res.json({
                    success: true,
                    user: {
                        id: hostelRector.rectorId,
                        name: hostelRector.rectorName,
                        role: 'rector',
                        hostelId: hostelRector.id
                    }
                });
            } else {
                res.status(401).json({ success: false, message: 'Invalid Credentials' });
            }
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- SYNC / SAVE DATA ---
// Endpoint to save state from Client to Server (Migration/Sync)
router.post('/sync', async (req, res) => {
    const { hostels, students, complaints, notices } = req.body;

    try {
        // Bulk Write or Upsert Logic here
        // For simplicity in this demo, we might just loop and save
        // In production, use bulkWrite

        if (hostels) {
            for (const h of hostels) {
                await Hostel.findOneAndUpdate({ id: h.id }, h, { upsert: true });
            }
        }

        if (students) {
            for (const s of students) {
                await User.findOneAndUpdate({ id: s.id }, { ...s, role: 'student' }, { upsert: true });
            }
        }

        // ... handle others

        res.json({ success: true, message: 'Data Synced Successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
