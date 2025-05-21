import mongoose from "mongoose"

const reviewSchema = new mongoose.Schema({
    reviewBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    comment: {
        type: String,
        required: false
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    reviewFor: {
        kind: {
            type: String,
            required: true,
            enum: ["Farm", "Product"]
        },
        connect: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'reviewFor.kind'
        }
    }
},{ timestamps: true })

const Review = mongoose.model('Review', reviewSchema)
