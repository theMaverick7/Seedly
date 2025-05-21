import mongoose from "mongoose"

const reference = mongoose.Schema.Types.ObjectId

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        enum: [
            'fruits',
            'vegetables',
            'dairy',
            'legumes',
            'meat'
        ],
        required: true
    },
    product: {
        type: reference,
        ref: 'Product'
    } 
}, { timestamps: true });

export const Category = mongoose.model('Category', categorySchema)