import mongoose from "mongoose"

const reference = mongoose.Schema.Types.ObjectId

const qualitySchema = new mongoose.Schema({
    name: {
        type: String,
        enum: ['premium', 'standard', 'economy'],
        required: true
    },
    product: {
        type: reference,
        ref: 'Product'
    }
}, { timestamps: true })

export const Quality = mongoose.model('Quality', qualitySchema)