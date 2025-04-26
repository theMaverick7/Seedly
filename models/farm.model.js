import mongoose from "mongoose";
import { cloudAsset } from "./sharedSchemas.js";
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

export const joiSchema = Joi.object({
        username: Joi.string()
            .min(5)
            .max(30)
            .lowercase()
            .required(),

        fullname: Joi.string()
            .required(),

        password: Joi.string()
            .min(8)
            .max(30)
            .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/)
            .required(),

        email: Joi.string()
            .email()
            .regex(/[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
            .required()
})

export const Farm = mongoose.model('Farm', farmSchema);