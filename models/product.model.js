import mongoose from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const reference = mongoose.Schema.Types.ObjectId;

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    quality: {
        type: reference,
        ref: 'Quality',
        required: true
    },
    category: {
        type: reference,
        ref: 'Category',
        required: true
    },
    price: {
        type: reference,
        ref: "Price"
    },
    description: {
        type: String,
        required: false
    },
    inStock: {
        type: Boolean,
        required: true
    },
    pictures: {
        type: String,
        required: false
    },
    videos: {
        type: String,
        required: false
    },
    createdBy: {
        type: reference,
        ref: 'Farm'
    },
    reviews: [
        {
            type: reference,
            ref: 'Review'
        }
    ]
}, { timestamps: true });

mongoose.plugin(mongooseAggregatePaginate);

export const Product = mongoose.model('Product', productSchema);