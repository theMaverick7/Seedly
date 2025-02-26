import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Product } from "../../models/product.model.js";
import { Quality } from "../../models/quality.model.js";
import { Category } from "../../models/category.model.js";
import { Price } from "../../models/price.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { upload } from "../middlewares/multer.middleware.js";
import { Farm } from "../../models/farm.model.js";

const createProduct = asyncHandler(async(req, res) => {
    try {
    
    const {
        name,
        quality,
        category,
        price,
        description,
        inStock
    } = req.body;

    const { id } = req.params;

    const fieldEmpty = [name, quality, category, price, description, inStock]
    .some((elem) => elem.trim() === '');

    if(fieldEmpty) throw new apiError('all fields required');

    const existedProd = await Product.findOne({name});

    if(existedProd) throw new apiError('Product already exist');

    let localPicturesPath, localVideosPath;

    if(req.files && Array.isArray(req.files.pictures) && req.files.pictures.length > 0)
    localPicturesPath = req.files.pictures[0].path;

    if(req.files && Array.isArray(req.files.videos) && req.files.videos.length > 0)
    localVideosPath = req.files.videos[0].path;

    if(!localPicturesPath) throw new apiError(400,'No local pictures path');
    if(!localVideosPath) throw new apiError(400, 'No local videos path');

    const createdPrice = await Price.create({
        value: price
    });

    const createdQuality = await Quality.create({
        name: quality
    });

    const createdCategory = await Category.create({
        name: category
    });

    const thePrice = await Price.findById(createdPrice._id);
    const theQuality = await Quality.findById(createdQuality._id);
    const theCategory = await Category.findById(createdCategory._id);
    const theFarm = await Farm.findById(id);

    if(!thePrice || !theQuality || !theCategory || !theFarm) throw new apiError(500);

    let picturesUpload = await uploadOnCloudinary(localPicturesPath);
    let videosUpload = await uploadOnCloudinary(localVideosPath);

    if(!picturesUpload) throw new apiError('pictures upload failed');
    if(!videosUpload) throw new apiError('videos upload failed');

    const createProd = await Product.create({
        name,
        description,
        inStock,
        pictures: picturesUpload.url || '',
        videos: videosUpload.url || '',
        price: thePrice._id,
        quality: theQuality._id,
        category: theCategory._id,
        createdBy: theFarm._id
    });

    const thisProduct = await Product.findById(createProd._id);

    if(!thisProduct) throw new apiError(500,'product creation failed');

    console.log('Product Created Successfully', thisProduct);

    return res.status(200).json(
        new apiResponse(200, thisProduct, 'Product created successfully')
    );

    } catch (error) {
        console.log(error)
    }
})

export {createProduct};