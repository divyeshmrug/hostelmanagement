const mongoose = require('mongoose');

// User Schema (Students, Rectors, Admins)
const UserSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // UID or generated ID
    name: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'rector', 'super_admin'], required: true },
    hostelId: { type: String }, // For students/rectors
    room: { type: String }, // For students
    email: { type: String },
    phone: { type: String },
    joinedDate: { type: String },
    // Student specific fields
    guardianName: { type: String },
    guardianPhone: { type: String },
    // Auth
    lastLogin: { type: Date }
});

// Hostel Schema
const HostelSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    rectorId: { type: String, required: true },
    rectorName: { type: String },
    totalRooms: { type: Number },
    rooms: [{
        number: String,
        type: { type: String, enum: ['AC', 'Non-AC'] },
        floor: Number,
        capacity: Number,
        occupants: [String], // Array of Student IDs
        status: { type: String, default: 'Vacant' },
        rent: Number
    }]
});

// Notice Schema
const NoticeSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    hostelId: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

// Complaint Schema
const ComplaintSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    type: { type: String, required: true },
    description: String,
    studentId: String,
    hostelId: String,
    status: { type: String, default: 'Pending' }, // Pending, Resolved
    date: { type: Date, default: Date.now }
});

// Fee Schema
const FeeSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    studentId: String,
    hostelId: String,
    amount: Number,
    dueDate: String,
    status: { type: String, enum: ['paid', 'pending', 'overdue'], default: 'pending' },
    paidDate: String
});

module.exports = {
    User: mongoose.model('User', UserSchema),
    Hostel: mongoose.model('Hostel', HostelSchema),
    Notice: mongoose.model('Notice', NoticeSchema),
    Complaint: mongoose.model('Complaint', ComplaintSchema),
    Fee: mongoose.model('Fee', FeeSchema)
};
