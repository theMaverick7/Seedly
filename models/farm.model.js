import mongoose from "mongoose";
import { cloudAsset, fileSchema } from "./sharedSchemas.js";
import Joi from "joi";

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
}, { timestamps: true });

export const farmJoiSchema = Joi.object({
        name: Joi.string()
            .max(15)
            .required(),

        description: Joi.string()
            .required(),

        location: Joi.string()
            .min(8)
            .max(30)
            .required(),

        pictures: [fileSchema],
        videos: [fileSchema]
})

export const Farm = mongoose.model('Farm', farmSchema);