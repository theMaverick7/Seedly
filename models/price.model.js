import mongoose from "mongoose";

const reference = mongoose.Schema.Types.ObjectId;

const priceSchema = new mongoose.Schema({
    value: {
        type: Number,
        required: true
    },
    product: {
        type: reference,
        ref: 'Product'
    }
});

export const Price = mongoose.model('Price', priceSchema);