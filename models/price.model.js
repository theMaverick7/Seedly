import mongoose from "mongoose";

const priceSchema = new mongoose.Schema({
    value: {
        type: Number,
        required: true
    }
});

export const Price = mongoose.model('Price', priceSchema);