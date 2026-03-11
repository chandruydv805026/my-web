const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
    ipAddress: String,
    deviceModel: String,
    os: String,
    browser: String,
    city: String, // Approximate (IP se)
    isp: String,  // Jio/Airtel
    batteryLevel: String, // Front-end se aayega
    screenWidth: String,
    timestamp: { type: Date, default: Date.now },
    referer: String // Instagram ya Direct
});

module.exports = mongoose.model('Visitor', visitorSchema);
