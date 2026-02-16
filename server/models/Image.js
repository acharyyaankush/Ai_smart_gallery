const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
    imageUrl:{
        type: String,
        required: true
    },
    fileName:{
        type: String,
        required: true
    },
    tags:{
        type: [String],
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Image', ImageSchema);