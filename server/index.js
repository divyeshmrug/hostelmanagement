const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MongoDB URI is missing in .env file!');
    console.log('Please create a .env file and add MONGODB_URI=your_connection_string');
} else {
    mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
        .then(() => console.log('✅ Connected to MongoDB successfully'))
        .catch(err => console.error('❌ MongoDB Connection Error:', err));
}

// Basic Route
app.get('/', (req, res) => {
    res.send('Lumina Hostel API is running...');
});

// Import Routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
