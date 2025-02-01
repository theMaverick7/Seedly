import mongoose, { mongo } from "mongoose";

const fOwnerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    farms: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Farm"
        }
    ]
},{timestamps: true});

export const FarmOwner = mongoose.model('FarmOwner', fOwnerSchema);