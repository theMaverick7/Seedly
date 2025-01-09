import mongoose from "mongoose";

const qualitySchema = new mongoose.Schema({
    name: {
        type: String,
        enum: ['premium', 'standard', 'economy'],
        required: true
    }
}, { timestamps: true });

export const Quality = mongoose.model('Quality', qualitySchema);