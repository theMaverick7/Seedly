import mongoose from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';


const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    quality: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quality'
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    stock: {
        type: Boolean,
        required: true
    },
    img: {
        type: String,
        required: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farm'
    }
}, { timestamps: true });

mongoose.plugin(mongooseAggregatePaginate);

export const Product = mongoose.model('Product', productSchema);