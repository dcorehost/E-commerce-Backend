const mongoose = require('mongoose');
const { Schema } = mongoose;

const contactUsSchema = new Schema(
    {
        name: {
            type: String
        },
        emailId: {
            type: String
        },
        phone: {
            type: String
        },
        message: {
            type: String
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('contactUs', contactUsSchema);
