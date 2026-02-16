const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// 1. CORS Configuration
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// 2. STATIC IMAGE SERVING (Must be above React routes)
// This serves images and fixes the .jfif MIME type for the browser
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.jfif')) {
      res.setHeader('Content-Type', 'image/jpeg');
    }
  }
}));

// 3. DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to database"))
    .catch(err => console.error("Database error:", err));

// 4. API ROUTES
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// 5. REACT FRONTEND SERVING
// Serve the built files from the client/dist folder
const clientPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientPath));

// The Catch-all route to handle React Router (MUST be at the very bottom)
app.get('/*path', (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

// 6. SERVER START
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log(`Serving images from: ${path.join(__dirname, 'uploads')}`);
});