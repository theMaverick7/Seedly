import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Farm } from "../../models/farm.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const createFarm = asyncHandler(async(req, res) => {
    try {
        
    const {name, description, location} = req.body;

    const fieldEmpty = [name, description, location]
    .some((elem) => elem.trim() === '');

    if(fieldEmpty) throw new apiError(400, 'all fields required');

    const existedFarm = await Farm.findOne({name});

    if(existedFarm) throw new apiError(400, 'farm already existed');

    let localPicturesPath, localVideosPath;

    if(req.files && Array.isArray(req.files.pictures) && req.files.pictures.length > 0)
    localPicturesPath = req.files.pictures[0].path;

    if(req.files && Array.isArray(req.files.videos) && req.files.videos.length > 0)
    localVideosPath = req.files.videos[0].path;

    if(!localPicturesPath) throw new apiError(400, 'no local pictures path');
    if(!localVideosPath) throw new apiError(400, 'no local videos path');

    const picturesUpload = await uploadOnCloudinary(localPicturesPath);
    const videosUpload = await uploadOnCloudinary(localVideosPath);

    if(!picturesUpload && !videosUpload) throw new apiError(500, 'cloud upload failed');

    const createFarm = await Farm.create({
        name,
        description,
        location,
        pictures: picturesUpload.url || '',
        videos: videosUpload.url || ''
    });

    const theFarm = await Farm.findById(createFarm._id);

    if(!theFarm) throw new apiError(500,'farm creation failed');

    console.log('farm created successfully');

    return res.status(200).json(
        new apiResponse(200, theFarm, 'farm created successfully')
    );

    } catch (error) {
        console.log(error)
    }
})

export {createFarm};