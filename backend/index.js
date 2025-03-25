const express = require('express');
const app = express();
const uploadRoutes = require('./routes/uploadRoutes');

// ...existing code...

// Add this line with your other route configurations
app.use('/api/upload', uploadRoutes);

// ...existing code...