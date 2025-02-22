import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { validateEmail, validatePassword } from "../utils/validations.js";
import { User } from "../../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async(req, res) => {
    try {

    const {username, fullname, email, password} = req.body;

    const fieldEmpty = [username, fullname, email, password]
    .some((elem) => elem.trim() === '');

    if(fieldEmpty) throw new apiError(400, 'all fields required');

    if (!validateEmail(email) && !validatePassword) 
    throw new apiError(400, 'incorrect password or email format');

    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    });

    if(existedUser) throw new apiError(500, 'user already exist');

    let localFilePath;

    if(req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0)
    localFilePath = req.files.avatar[0].path;

    if(!localFilePath) throw new apiError(400, 'no local file path');

    const cloudUpload = await uploadOnCloudinary(localFilePath);

    if (!cloudUpload) throw new apiError(500, 'cloudinary upload failed');

    const createUser = await User.create({
        username: username.toLowerCase(),
        fullname,
        email,
        password,
        avatar: cloudUpload.url || ''
    });

    const theUser = User.findById(createUser._id).select("-refreshToken -password");

    if(!theUser) throw new apiError(500, 'user registration failed');

    console.log('user registered successfully');

    return res.status(200).json(
        new apiResponse(200, theUser, 'user registered successfully')
    );

    } catch (error) {
        console.log(error)
    }
})

export {registerUser};