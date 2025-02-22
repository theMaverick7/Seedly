import {asyncHandler} from '../utils/asyncHandler.js';
import {apiError} from '../utils/apiError.js';
import {apiResponse} from '../utils/apiResponse.js';
import { validateEmail, validatePassword } from '../utils/validations.js';
import { FarmOwner } from '../../models/farmOwner.model.js';
import mongoose from 'mongoose';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

const registerFarmowner = asyncHandler(async(req, res) => {
    try {
        
        const {username, fullname, email, password} = req.body;

        const fieldEmpty = [username, fullname, email, password].some((elem) => elem.trim() === '');

        if (fieldEmpty) throw new apiError(400, 'all fields are required');

        if(!validateEmail(email)) throw new apiError(400, 'email format incorrect');
        if(!validatePassword(password)) throw new apiError(400, 'password format incorrect');

        const existedFarmowner = await FarmOwner.findOne({
            $or: [{username}, {email}]
        });

        if(existedFarmowner) throw new apiError(500, 'farmowner already exist');

        let localFilePath;

        if(req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0)
        {
            localFilePath = req.files.avatar[0].path;
        }

        if(!localFilePath) throw new apiError(400, 'local file path required');

        const cloudUpload = await uploadOnCloudinary(localFilePath);

        if(!cloudUpload) throw new apiError(500, 'Cloudinary upload failed');

        const newFarmowner = await FarmOwner.create({
            username: username.toLowerCase(),
            fullname,
            email,
            password,
            avatar: cloudUpload.url || ''
        });

        const theFarmowner = await FarmOwner.findById(newFarmowner._id).select(
            "-refreshToken -password"
        );

        if(!theFarmowner) throw new apiError(500, 'farmowner registration failed');

        console.log('Farmowner registered successfully');
        
        return res.status(200).json(
            new apiResponse(200, theFarmowner, 'farmowner registered successfully')
        );

    } catch (error) {
        console.log(error)
    }
})

export {registerFarmowner};