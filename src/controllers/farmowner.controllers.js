import {asyncHandler} from '../utils/asyncHandler.js';
import {apiError} from '../utils/apiError.js';
import {apiResponse} from '../utils/apiResponse.js';
import { validateEmail, validatePassword } from '../utils/validations.js';
import { FarmOwner } from '../../models/farmOwner.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { tokenGen } from '../utils/jwtGen.js';
import jwt from 'jsonwebtoken';

// create controllers
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
});

// auth controllers
const loginFarmowner = asyncHandler(async(req, res) => {
    try {

    const {username, email, password} = req.body;

    if( !(username || email) && !password ) throw new apiError(400, 'These fields are required');

    const foundOwner = await FarmOwner.findOne({
        $or: [{username}, {email}]
    })

    if(!foundOwner) throw new apiError(400, 'Farmowner not found');

    const passCheck = await foundOwner.validatePassword(password);

    if(!passCheck){
        console.log('Login failed');
        throw new apiError(400,'incorrect password');
    }

    const {accessToken, refreshToken} = await tokenGen(foundOwner);

    // to check if refreskToken is updated
    console.log(`refresh token check: ${foundOwner}`);

    const loggedFarmowner = await FarmOwner.findById(foundOwner._id).select("-refreshToken -password");

    const options = {
        httpOnly: true,
        secure: true
    }

    res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new apiResponse(200, {
            farmowner: loggedFarmowner,
            accessToken,
            refreshToken
        }, 'Farmowner logged in successfully')
    )
 
    } catch (error) {
        console.log(error);
    }
});

const logoutFarmowner = asyncHandler(async(req, res) => {
    try {

    const ownerUpdated = await FarmOwner.findByIdAndUpdate(req.farmowner._id,
        {
            $set: {
                "refreshToken": null
            }
    }, {new: true});

    console.log(ownerUpdated);

    const options = {
        httpOnly: true,
        secure: true
    }
    
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new apiResponse(200, {}, 'farmowner logged out')
    );


    } catch (error) {
        console.log(error)
    }
})

const refreshAccessToken = asyncHandler(async(req, res) => {

    try {

        const incomingRefreshToken = req.cookies.refreshToken ||
        req.body.refreshToken

        if(!incomingRefreshToken) throw new apiError(401, 'unauthorized access')

        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const theFarmowner = await FarmOwner.findById(decodedToken?._id)

        if(!theFarmowner) throw new apiError(500, 'farmowner not found')

        if(theFarmowner.refreshToken !== incomingRefreshToken)
        throw new apiError(500, 'refresh token unmatched')

        const {accessToken, newRefreshToken} = await tokenGen(theFarmowner)

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new apiResponse(
                200,
                {
                    accessToken,
                    refreshToken
                },
                "new access token generated"
            )
        )

    } catch (error) {
        console.log(error)
    }

})

// read controllers
const readFarmowner = asyncHandler(async(req, res) => {

    const theFarmowner = req.farmowner
    
    console.log(theFarmowner)
    
    return res
    .status(200)
    .json(
        new apiResponse(200, theFarmowner, 'farmowner fetched')
     )

})

// update controllers
const changeUsername = asyncHandler(async(req, res) => {

    try {
        
    const {username} = req.body

    const updatedFarmowner = await FarmOwner.findByIdAndUpdate(req.farmowner._id, {
        $set: {
            username: username
        }
    }, {new: true})

    if(!updatedFarmowner) throw new apiError(500, 'username update failed')

    console.log(updatedFarmowner)

    return res
    .status(200)
    .json(
        new apiResponse(200, updatedFarmowner, 'username changed')
    )


    } catch (error) {
        console.log(error)
    }
})

const changePassword = asyncHandler(async(req, res) => {
    
    try {

        const {currentPassword, newPassword} = req.body

        const foundFarmowner = await FarmOwner.findById(req.farmowner._id)

        const pswdCheck = await foundFarmowner.validatePassword(currentPassword)

        if(!pswdCheck) throw new apiError(401, 'password not correct')

        foundFarmowner.password = newPassword
        await foundFarmowner.save({validateBeforeSave: false})
    
        // const updatedFarmowner = await FarmOwner.updateOne(foundFarmowner, {
        //     $set: {
        //         "password": newPassword
        //     }
        // })
    
        return res
        .status(200)
        .json(
            new apiResponse(200, {}, 'password changed successfully')
        )

    } catch (error) {
        console.log(error)
    }

})

const changeAvatar = asyncHandler(async(req, res) => {

    try {

        const localFilePath = req.files.avatar[0].path
    
        if(!localFilePath) throw new apiError(401, 'you must upload an image file')
    
        const cloudUpload = await uploadOnCloudinary(localFilePath)
    
        if(!cloudUpload) throw new apiError(500, 'image upload failed')
    
        const updatedFarmowner = await FarmOwner.findByIdAndUpdate(req.farmowner._id, {
            $set: {
                avatar: cloudUpload.url
            }
        }, {new: true})
    
        return res.
        status(200)
        .json(
            new apiResponse(200, updatedFarmowner, 'avatar changed')
        )
        
    } catch (error) {
        console.log(error)
    }

})

export {
    registerFarmowner,
    readFarmowner,
    loginFarmowner,
    logoutFarmowner,
    refreshAccessToken,
    changeUsername,
    changePassword,
    changeAvatar
}