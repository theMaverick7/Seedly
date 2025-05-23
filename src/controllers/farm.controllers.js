import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Farm } from "../../models/farm.model.js";
import { FarmOwner } from "../../models/farmOwner.model.js";
import { Product } from "../../models/product.model.js";
import { uploadAndSaveCloudAssets } from "../utils/uploadAndSaveCloudAssets.js";
import mongoose from "mongoose";

// Create a new farm
const createFarm = asyncHandler(async (req, res) => {
    const {
        validatedTextValues: userData,
        validatedPictures,
        validatedVideos,
    } = res.locals;

    const foundFarmOwner = await FarmOwner.findById(req.farmowner._id);
    if (!foundFarmOwner) {
        throw new apiError(404, "Farm owner not found");
    }

    const existingFarm = await Farm.findOne({ name: userData.name });
    if (existingFarm) {
        throw new apiError(400, "Farm already exists");
    }

    const newFarm = await Farm.create({
        ...userData,
        createdBy: foundFarmOwner._id,
    });

    if (validatedPictures) {
        await uploadAndSaveCloudAssets(validatedPictures, newFarm, "pictures");
    }
    if (validatedVideos) {
        await uploadAndSaveCloudAssets(validatedVideos, newFarm, "videos");
    }

    foundFarmOwner.farms.push(newFarm._id);
    await foundFarmOwner.save();

    console.log('Farm created successfully', newFarm);

    return res.status(201).json(
        new apiResponse(201, newFarm, "Farm created successfully")
    );
});

// Get all farms
const exploreFarms = asyncHandler(async (_, res) => {
    const farms = await Farm.find();
    console.log(farms);

    return res
        .status(200)
        .json(new apiResponse(200, farms, "All farms fetched"));
});

// Get a single farm by ID
const readFarm = asyncHandler(async (req, res) => {
    const farm = await Farm.findById(req.params.id);
    console.log(farm);

    return res
        .status(200)
        .json(new apiResponse(200, farm, "Farm fetched successfully"));
});

// Edit a farm
const editFarm = asyncHandler(async (req, res) => {
    const {
        validatedTextValues: farmData,
        validatedPictures,
        validatedVideos,
    } = res.locals;
    const { farmid } = req.params;
    const { imagesIds = [], videosIds = [] } = farmData.removeAssets || {};

    const foundFarm = await Farm.findById(farmid);
    if (!foundFarm) throw new apiError(404, "Farm not found");

    if (imagesIds.length) {
        await Farm.findOneAndUpdate(
            { _id: foundFarm._id },
            { $pull: { pictures: { public_id: { $in: imagesIds } } } },
            { new: true }
        );
        await deleteFiles(imagesIds);
    }

    if (videosIds.length) {
        await Farm.findOneAndUpdate(
            { _id: foundFarm._id },
            { $pull: { videos: { public_id: { $in: videosIds } } } },
            { new: true }
        );
        await deleteFiles(videosIds, "video");
    }

    if (validatedPictures) {
        await uploadAndSaveCloudAssets(
            validatedPictures,
            foundFarm,
            "pictures"
        );
    }

    if (validatedVideos) {
        await uploadAndSaveCloudAssets(
            validatedVideos,
            foundFarm,
            "videos"
        );
    }

    const updatedFarm = await Farm.findById(farmid);

    console.log("Farm updated successfully");

    res
        .status(200)
        .json(new apiResponse(200, updatedFarm, "Farm updated successfully"));
});

// Delete a farm
const deleteFarm = asyncHandler(async (req, res) => {
    const { farmid } = req.params;
    const session = await mongoose.startSession();

    try {

        await session.withTransaction(async() => {
            await Farm.findByIdAndDelete(farmid);
            const deletedProducts = await Product.deleteMany({
                createdBy: farmid,
            }, { session });

            await FarmOwner.findByIdAndUpdate(req.farmowner._id, {
                $pull: {
                    farms: farmid,
                },
            }, { session });

            console.log("Farm deleted successfully");
            console.log(`Products deleted: ${deletedProducts.deletedCount}`);
        });
        await session.endSession();

        res.status(200)
        .json(new apiResponse(200, {}, "Farm deleted successfully"));

    } catch (error) {
        await session.endSession();
        throw new apiError(500, `error deleting farm: ${error.message}`);
    }
});

export {
    createFarm,
    exploreFarms,
    readFarm,
    deleteFarm,
    editFarm,
};
