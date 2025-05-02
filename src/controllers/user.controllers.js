import { asyncHandler } from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { User } from "../../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { tokenGen } from "../utils/jwtGen.js"
import jwt from 'jsonwebtoken'

const registerUser = asyncHandler(async(req, res) => {
    try {

        const userData = res.locals.validatedBody
        const avatar = res.locals.file

        const existedUser = await User.findOne({
            $or: [{username: userData.username}, {email: userData.email}]
        });

        if(existedUser) throw new apiError(500, 'user already exist');

        let cloudUpload

        if(avatar)
            cloudUpload = await uploadOnCloudinary(avatar.path)

        const createUser = await User.create({
            ...userData,
            avatar: {
                url: cloudUpload?.url || '',
                asset_id: cloudUpload?.asset_id || ''
             }
        });

        const theUser = await User.findById(createUser._id).select("-refreshToken -password");

        if(!theUser) throw new apiError(500, 'user registration failed');

        console.log('user registered successfully');

        return res.status(200).json(
            new apiResponse(200, theUser, 'user registered successfully')
        );

    } catch (error) {
        console.log(error)
    }
})

const loginUser = asyncHandler(async(req, res) => {
    try {
    
    const {username, email, password} = req.body

    if(!(username || email)) throw new apiError(400, 'username or email is required')

    const foundUser = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!foundUser) throw new apiError(500, 'user not found')

    const isPswdCorrect = await foundUser.validatePassword(password)

    if(!isPswdCorrect) throw new apiError(400, 'password incorrect')

    const {accessToken, refreshToken} = await tokenGen(foundUser)

    const loggedUser = await User.findById(foundUser._id).select('-refreshToken -password')

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
        new apiResponse(200, {
            user: loggedUser,
            accessToken,
            refreshToken
        })
    )

    } catch (error) {
        console.log(error)
    }
})

const logoutUser = asyncHandler(async(req, res) => {

    try {
    
    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken: undefined
        }
    }, {new: true})

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(
        new apiResponse(200, {}, 'user logged out successfully')
    )
    
    } catch (error) {
        console.log(error)
    }

})

const refreshAccessToken = asyncHandler(async(req, res) => {

    try {
    
    const incomingToken = req.cookies.refreshToken || req.body.refreshToken

    const decodedToken =  jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET)

    if(!decodedToken) throw new apiError(401, 'invalid token')

    const user = await User.findById(decodedToken._id)

    if(incomingToken !== user.refreshToken)
    throw new apiError(401, 'tokens unmatched')

    const {accessToken, newRefreshToken} = await tokenGen(user)
    
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
        new apiResponse(200, {
            accessToken,
            refreshToken: newRefreshToken
        }, 'new access token generated')
    )


    } catch (error) {
        console.log(error)
    }

})

const readUser = asyncHandler(async(req, res) => {
    
    const user = req.user

    console.log(user)

    return res
    .status(200)
    .json(
        new apiResponse(200, user, 'user fetched')
    )


})

// update controllers
const changeUsername = asyncHandler(async(req, res) => {

    try {
        
    const {username} = req.body

    const updatedUser = await User.findByIdAndUpdate(req.user._id, {
        $set: {
            username: username
        }
    }, {new: true})

    if(!updatedUser) throw new apiError(500, 'username update failed')

    console.log(updatedUser)

    return res
    .status(200)
    .json(
        new apiResponse(200, updatedUser, 'username changed')
    )


    } catch (error) {
        console.log(error)
    }
})

const changePassword = asyncHandler(async(req, res) => {
    
    try {

        const {currentPassword, newPassword} = req.body

        const foundUser = await User.findById(req.user._id)

        const pswdCheck = await foundUser.validatePassword(currentPassword)

        if(!pswdCheck) throw new apiError(401, 'password not correct')

        foundUser.password = newPassword
        await foundUser.save({validateBeforeSave: false})
    
        // const updatedUser = await User.updateOne(foundUser, {
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
    
        const updatedUser = await User.findByIdAndUpdate(req.user._id, {
            $set: {
                avatar: cloudUpload.url
            }
        }, {new: true})
    
        return res.
        status(200)
        .json(
            new apiResponse(200, updatedUser, 'avatar changed')
        )
        
    } catch (error) {
        console.log(error)
    }

})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    readUser,
    changeUsername,
    changePassword,
    changeAvatar
};