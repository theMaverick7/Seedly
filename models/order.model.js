import mongoose from "mongoose"

const orderedItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    quantity: {
        type: Number,
        required: true
    }
})

const addressSchema = new mongoose.Schema({
    addressLine: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    postalCode: {
        type: String,
        required: false
    }
})

const orderSchema = new mongoose.Schema({
    consumer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    price: {
        type: Number,
        required: true,
        default: 0
    },
    order: {
        type: [orderedItemSchema]
    },
    status: {
        type: String,
        enum: ['Pending', 'Cancelled', "Delivered"]
    },
    address: {
        type: [addressSchema]
    }
}, { timestamps: true })

export const Order = moongose.model('Order', orderSchema)