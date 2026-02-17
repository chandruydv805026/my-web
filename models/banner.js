const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    title: { type: String }, 
    img: { type: String, required: true }, // बैनर इमेज का पाथ
    active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);