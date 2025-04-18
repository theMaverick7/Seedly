import mongoose from "mongoose";

const reference = mongoose.Schema.Types.ObjectId;

const farmSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    pictures: {
        type: String
    },
    videos: {
        type: String
    },
    createdBy: {
        type: reference,
        ref: 'Farmowner'
    },
    products: [
        {
            type: reference,
            ref: 'Product'
        }
    ],
    reviews: [
        {
            type: reference,
            ref: 'Review'
        }
    ]
}, { timestamps: true });

export const Farm = mongoose.model('Farm', farmSchema);