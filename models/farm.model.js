import mongoose from "mongoose"
import { cloudAsset } from "./sharedSchemas.js"

const reference = mongoose.Schema.Types.ObjectId

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
    pictures: [cloudAsset],
    videos: [cloudAsset],
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
}, { timestamps: true })

export const Farm = mongoose.model('Farm', farmSchema)