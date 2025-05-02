import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Farm } from "../../models/farm.model.js";
import { FarmOwner } from "../../models/farmOwner.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Product } from "../../models/product.model.js";

const createFarm = asyncHandler(async(req, res) => {
    try {
        
        const userData = res.locals.validatedBody
        const validatedPictures = res.locals.validatedPictures
        const validatedVideos = res.locals.validatedVideos

        console.log('coming from farm controller')
        console.log(userData, validatedPictures, validatedVideos)

        const picturesPaths = []
        const videosPaths = []

        validatedPictures.forEach((picture) => picturesPaths.push(picture.path))
        validatedVideos.forEach((video) => videosPaths.push(video.path))

        console.log(picturesPaths, videosPaths)

        const { id } = req.params;

        const foundFarmowner = await FarmOwner.findById(id);

        if(!foundFarmowner) throw new apiError(500, 'farmowner not found')

        const existedFarm = await Farm.findOne({name: userData.name});

        if(existedFarm) throw new apiError(400, 'farm already existed')

        let picturesUpload, videosUpload

        const mapped1 = picturesPaths.map(async(path) => {
            return await uploadOnCloudinary(path)
        })

        const mapped2 = videosPaths.map(async(path) => {
            return await uploadOnCloudinary(path)
        })

        const promised1 = await Promise.all(mapped1)
        const promised2 = await Promise.all(mapped2)

        console.log(promised1)
        console.log(promised2)

        const createFarm = await Farm.create({
            ...userData,
            createdBy: foundFarmowner._id
        });

        const theFarm = await Farm.findById(createFarm._id);

        if(!theFarm) throw new apiError(500,'farm creation failed');

        promised1.forEach((obj) => {
            theFarm.pictures.push({
                url: obj.url,
                asset_id: obj.asset_id
            })
        })

        promised2.forEach((obj) => {
            theFarm.videos.push({
                url: obj.url,
                asset_id: obj.asset_id
            })
        })

        foundFarmowner.farms.push(theFarm._id)
        await theFarm.save()
        await foundFarmowner.save()

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