import mongoose from "mongoose"
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { cloudAsset } from "./joiSchemas/sharedSchemas.js"

const reference = mongoose.Schema.Types.ObjectId

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
    avatar: {
        type: cloudAsset,
        default: null
    },
    refreshToken: {
        type: String
    },
    farms: [
        {
            type: reference,
            ref: "Farm"
        }
    ]
},{timestamps: true, minimize: false})

fOwnerSchema.pre('save', async function(next){

    if(!this.isModified("password"))
        return next()

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

fOwnerSchema.methods.validatePassword = async function(password){
    return await bcrypt.compare(password, this.password)
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

export const FarmOwner = mongoose.model('FarmOwner', fOwnerSchema)