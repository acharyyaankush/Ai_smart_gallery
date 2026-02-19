const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Image = require('../models/Image');
const axios = require('axios');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ai_smart_gallery', // Folder name in your Cloudinary dashboard
    allowed_formats: ['jpg', 'png', 'jpeg', 'jfif'],
  },
});

const upload = multer({ storage: storage });

// router.post('/upload', upload.single('image'), async (req, res) => {
//   try {
//     console.log("✅ Checkpoint 1: File saved locally.");
    
//     if (!req.file) {
//       return res.status(400).json({ error: "No image file uploaded" });
//     }

//     const filePath = req.file.path;
//     const imageBuffer = fs.readFileSync(filePath); 

//     console.log(`⌛ Checkpoint 2: Sending to Hugging Face (Type: ${req.file.mimetype})...`);

//     // UPDATED URL: Using the 'models/' prefix which is the current standard
//     const response = await axios.post(
//       'https://router.huggingface.co/hf-inference/models/facebook/detr-resnet-50', 
//       imageBuffer,
//       {
//         headers: {
//           'Authorization': `Bearer ${process.env.HF_TOKEN}`,
//           'Content-Type': req.file.mimetype 
//         },
//         params: { wait_for_model: true } 
//       }
//     );

//     const rawData = Array.isArray(response.data) ? response.data : [];
    
//     // 2. Filter, Map, and Remove Duplicates
//     const aiTags = [...new Set(
//       rawData
//         // Only keep tags if the AI is at least 80% confident (0.8 score)
//         .filter(item => item.score > 0.8) 
//         // Extract the label word and make it uppercase
//         .map(item => item.label.toUpperCase()) 
//     )];
    
//     console.log("🏷️ Cleaned AI Tags:", aiTags);

//     const newImage = new Image({
//       imageUrl: `http://localhost:5000/uploads/${req.file.filename}`,
//       fileName: req.file.filename,
//       tags: aiTags,
//     });

//     await newImage.save();
    
//     console.log("🚀 Checkpoint 3: AI tags saved to Database.");
//     res.status(201).json(newImage);

//   } catch (error) {
//     // This logs the specific reason Hugging Face rejected the request
//     const errorDetail = error.response?.data?.error || error.message;
//     console.error("💥 BACKEND ERROR:", errorDetail);
//     res.status(500).json({ 
//       error: "AI Processing failed", 
//       details: errorDetail 
//     });
//   }
// });

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    console.log("✅ Checkpoint 1: File uploaded directly to Cloudinary.");
    
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    // 1. Get the permanent Cloudinary URL provided by our new Multer setup
    const cloudinaryUrl = req.file.path; 

    console.log(`⌛ Checkpoint 2: Fetching image from Cloudinary to send to Hugging Face...`);

    // 2. We use Axios to download the image buffer from the Cloudinary URL
    const imageResponse = await axios.get(cloudinaryUrl, { responseType: 'arraybuffer' });
    const imageBuffer = imageResponse.data;

    // 3. Send the buffer to Hugging Face (Exactly like you had it!)
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
    
    // 4. Your custom AI Tag Filtering
    const aiTags = [...new Set(
      rawData
        .filter(item => item.score > 0.8) 
        .map(item => item.label.toUpperCase()) 
    )];
    
    console.log("🏷️ Cleaned AI Tags:", aiTags);

    // 5. Save the Cloudinary URL directly to MongoDB (Goodbye localhost!)
    const newImage = new Image({
      imageUrl: cloudinaryUrl, 
      fileName: req.file.filename,
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

router.get('/images', async (req, res) => {
  try {
    const images = await Image.find().sort({ createdAt: -1 });
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/images/:id', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ message: "Not found in DB" });

    // Correct pathing: 'uploads' is in the server root inside Docker
    const filePath = path.join(__dirname, '..', 'uploads', image.fileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Image.findByIdAndDelete(req.params.id);
    res.json({ message: "Synced delete successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;