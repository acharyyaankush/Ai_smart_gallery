const express = require('express');
const router = express.Router();
const multer = require('multer');
const Image = require('../models/Image');
const axios = require('axios');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// 1. Configure Cloudinary with your Render Environment Variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Tell Multer to use Cloudinary instead of local folders
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ai_smart_gallery', 
    allowed_formats: ['jpg', 'png', 'jpeg', 'jfif'],
  },
});

const upload = multer({ storage: storage });

// --- UPLOAD ROUTE ---
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    console.log("✅ Checkpoint 1: File uploaded directly to Cloudinary.");
    
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    // This is now a true https:// URL from Cloudinary
    const cloudinaryUrl = req.file.path; 

    console.log(`⌛ Checkpoint 2: Fetching image from Cloudinary to send to Hugging Face...`);

    // Download the image buffer from Cloudinary to feed the AI
    const imageResponse = await axios.get(cloudinaryUrl, { responseType: 'arraybuffer' });
    const imageBuffer = imageResponse.data;

    // Send the buffer to Hugging Face
    const response = await axios.post(
      'https://router.huggingface.co/hf-inference/models/facebook/detr-resnet-50', 
      imageBuffer,
      {
        headers: {
          'Authorization': `Bearer ${process.env.HF_TOKEN}`,
          'Content-Type': req.file.mimetype || 'image/jpeg'
        },
        params: { wait_for_model: true } 
      }
    );

    const rawData = Array.isArray(response.data) ? response.data : [];
    
    // Filter and clean AI Tags
    const aiTags = [...new Set(
      rawData
        .filter(item => item.score > 0.8) 
        .map(item => item.label.toUpperCase()) 
    )];
    
    console.log("🏷️ Cleaned AI Tags:", aiTags);

    // Save the permanent Cloudinary URL to MongoDB
    const newImage = new Image({
      imageUrl: cloudinaryUrl, // FIXED: No more localhost!
      fileName: req.file.filename, // Cloudinary provides a 'public_id' here
      tags: aiTags,
    });

    await newImage.save();
    
    console.log("🚀 Checkpoint 3: AI tags and Cloudinary link saved to Database.");
    res.status(201).json(newImage);

  } catch (error) {
    const errorDetail = error.response?.data?.error || error.message;
    console.error("💥 BACKEND ERROR:", errorDetail);
    res.status(500).json({ 
      error: "AI Processing or Upload failed", 
      details: errorDetail 
    });
  }
});

// --- GET ALL IMAGES ROUTE ---
router.get('/images', async (req, res) => {
  try {
    const images = await Image.find().sort({ createdAt: -1 });
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- DELETE ROUTE ---
router.delete('/images/:id', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ message: "Not found in DB" });

    // Delete the image from Cloudinary's servers
    if (image.fileName) {
      await cloudinary.uploader.destroy(image.fileName);
      console.log("🗑️ Image deleted from Cloudinary");
    }

    // Delete the record from MongoDB
    await Image.findByIdAndDelete(req.params.id);
    res.json({ message: "Synced delete successful" });
  } catch (error) {
    console.error("Delete Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;