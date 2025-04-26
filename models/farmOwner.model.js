import mongoose, { mongo } from "mongoose";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { cloudAsset, fileSchema } from "./sharedSchemas.js";
import Joi from "joi"

const reference = mongoose.Schema.Types.ObjectId;

const fOwnerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    fullname: {
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
    avatar: cloudAsset,
    refreshToken: {
        type: String
    },
    farms: [
        {
            type: reference,
            ref: "Farm"
        }
    ]
},{timestamps: true});

fOwnerSchema.pre('save', async function(next){
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
})

export const joiSchema = Joi.object({
        username: Joi.string()
            .min(5)
            .max(30)
            .lowercase()
            .required(),

        fullname: Joi.string()
            .required(),

		password: Joi.string()
            .min(8)
            .max(30)
            .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/)
            .required(),

		email: Joi.string()
            .email()
            .regex(/[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
            .required(),

        avatar: fileSchema
})

fOwnerSchema.methods.validatePassword = async function(password){
    return await bcrypt.compare(password, this.password);
}

fOwnerSchema.methods.generateAccessToken = function(){
    // returns a jwt token as a string
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
)}

fOwnerSchema.methods.generateRefreshToken = function(){

    // returns a jwt token as a string
    return jwt.sign({
        _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
)}

export const FarmOwner = mongoose.model('FarmOwner', fOwnerSchema);