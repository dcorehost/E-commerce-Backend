const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema(
    {
        username: {
            type: String,
            trim: true
        },

        phone: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        emailId: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            index: true
        },

        password: {
            type: String,
            required: true
        },

        dateOfBirth: {
            type: String
        },

        typeOfUser: {
            type: String,
            enum: ['Admin', 'User'],
            default: 'User'
        },

        active: {
            type: Boolean,
            default: true
        },

        address: [
            {
                type: Schema.Types.ObjectId,
                ref: 'address'
            }
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model('user', userSchema);
