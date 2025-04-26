import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Farm } from "../../models/farm.model.js";
import { FarmOwner } from "../../models/farmOwner.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Product } from "../../models/product.model.js";

const createFarm = asyncHandler(async(req, res) => {
    try {
        
    const { name, description, location } = req.body;

    const { id } = req.params;

    const fieldEmpty = [name, description, location]
    .some((elem) => elem.trim() === '');

    if(fieldEmpty) throw new apiError(400, 'all fields required');

    const foundFarmowner = await FarmOwner.findById(id);

    if(!foundFarmowner) throw new apiError(500, 'farmowner not found');

    const existedFarm = await Farm.findOne({name});

    if(existedFarm) throw new apiError(400, 'farm already existed');

    let localPicturesPath, localVideosPath;

    if(req.files && Array.isArray(req.files.pictures) && req.files.pictures.length > 0)
    localPicturesPath = req.files.pictures[0].path;

    if(req.files && Array.isArray(req.files.videos) && req.files.videos.length > 0)
    localVideosPath = req.files.videos[0].path;

    // if(!localPicturesPath) throw new apiError(400, 'no local pictures path');
    // if(!localVideosPath) throw new apiError(400, 'no local videos path');

    const picturesUpload = await uploadOnCloudinary(localPicturesPath);
    const videosUpload = await uploadOnCloudinary(localVideosPath);

    const createFarm = await Farm.create({
        name,
        description,
        location,
        pictures: {
            url: picturesUpload?.url || '',
            asset_id: picturesUpload?.asset_id || ''
        },
        videos: {
            url: videosUpload?.url || '',
            asset_id: videosUpload?.asset_id || ''
        },
        createdBy: foundFarmowner._id
    });

    const theFarm = await Farm.findById(createFarm._id);

    if(!theFarm) throw new apiError(500,'farm creation failed');

    foundFarmowner.farms.push(theFarm._id);
    await foundFarmowner.save();

    console.log('farm created successfully');

    return res.status(200).json(
        new apiResponse(200, theFarm, 'farm created successfully')
    );

    } catch (error) {
        console.log(error)
    }
})

const exploreFarms = asyncHandler(async(req, res) => {

    const farms = await Farm.find()

    console.log(farms)

    return res
    .status(200)
    .json(
        new apiResponse(200, {}, 'all farms fetched')
    )

})

const readFarm = asyncHandler(async(req, res) => {

    try {
      
    const {id} = req.params

    const farm = await Farm.findById(id)

    console.log(farm)

    return res
    .status(200)
    .json(
        new apiResponse(200, farm, 'farm fetched successfully')
    )

    } catch (error) {
        console.log(error)
    }

})

// update controllers
const updateDescription = asyncHandler(async(req, res) => {
    
    try {

    const {farmid} = req.params
    const {newDescription} = req.body

    const updatedFarm = await Farm.findByIdAndUpdate(farmid, {
        $set: {
            description: newDescription
        }
    }, {new: true})

    console.log(updatedFarm)

    return res
    .status(200)
    .json(
        new apiResponse(200, updatedFarm, 'description changed')
    )

    } catch (error) {
        console.log(error)
    }

})

const deleteFarm = asyncHandler(async(req, res) => {

    try {
    
    const {farmid} = req.params

    await Farm.findByIdAndDelete(farmid)

    const deletedProducts = await Product.deleteMany({
        createdBy: farmid
    })

    await FarmOwner.findByIdAndUpdate(req.farmowner._id, {
        $pull: {
            farms: farmid
        }
    })

    console.log('Farm deleted sucessfully')
    console.log(`products deleted: ${deletedProducts.deletedCount}`)

    res.
    status(200)
    .json(
        new apiResponse(200, {}, 'Farm deleted successfully')
    )

    } catch (error) {
        console.log(error)
    }

})

export {
    createFarm,
    exploreFarms,
    readFarm,
    updateDescription,
    deleteFarm
};