const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    // Unique ID जैसे 'aloo', 'tomato' आदि
    id: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    // सामान का नाम
    name: {
        type: String,
        required: true,
        trim: true
    },
    // कीमत (जो आप एडमिन पैनल से बदलेंगे)
    price: {
        type: Number,
        required: true,
        default: 0
    },
    // फोटो का लिंक (URL)
    img: {
        type: String,
        required: true,
        trim: true
    },
    // यूनिट जैसे 'kg' या 'pc'
    unit: {
        type: String,
        required: true,
        enum: ['kg', 'pc'], // सिर्फ kg या pc ही डाल पाएंगे
        default: 'kg'
    },
    // क्या सामान स्टॉक में है?
    inStock: {
        type: Boolean,
        default: true
    }
}, { 
    timestamps: true // इससे पता चलेगा कि आपने कब प्राइस अपडेट किया
});

module.exports = mongoose.model('Product', productSchema);