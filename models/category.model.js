import mongoose, { mongo } from "mongoose";

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
    }
}, { timestamps: true });

export const Category = mongoose.model('Category', categorySchema);