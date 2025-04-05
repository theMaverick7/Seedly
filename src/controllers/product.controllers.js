import { asyncHandler } from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { Product } from "../../models/product.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { Farm } from "../../models/farm.model.js"
import { FarmOwner } from "../../models/farmOwner.model.js"

const createProduct = asyncHandler(async (req, res) => {
  try {
    const { name, quality, category, price, description, inStock } = req.body

    const {farmownerid, farmid} = req.params;

    const theFarmowner = await FarmOwner.findById(req.farmowner._id);

    if(!theFarmowner) throw new apiError(500, 'farmowner not found');

    const fieldEmpty = [
      name,
      quality,
      category,
      price,
      description,
      inStock,
    ].some((elem) => elem.trim() === "")

    if (fieldEmpty) throw new apiError("all fields required")

    const existedProd = await Product.findOne({ name })

    if (existedProd) throw new apiError("Product already exist")

    let localPicturesPath, localVideosPath

    if (
      req.files &&
      Array.isArray(req.files.pictures) &&
      req.files.pictures.length > 0
    )
      localPicturesPath = req.files.pictures[0].path

    if (
      req.files &&
      Array.isArray(req.files.videos) &&
      req.files.videos.length > 0
    )
      localVideosPath = req.files.videos[0].path

    if (!localPicturesPath) throw new apiError(400, "No local pictures path")
    if (!localVideosPath) throw new apiError(400, "No local videos path")

    // const thePrice = await Price.findById(createdPrice._id);
    // const theQuality = await Quality.findById(createdQuality._id);
    // const theCategory = await Category.findById(createdCategory._id);
    const theFarm = await Farm.findById(farmid)

    if (!theFarm) throw new apiError(500, "Farm not found")

    // if (!thePrice || !theQuality || !theCategory || !theFarm)
    //   throw new apiError(500)

    let picturesUpload = await uploadOnCloudinary(localPicturesPath)
    let videosUpload = await uploadOnCloudinary(localVideosPath)

    if (!picturesUpload) throw new apiError("pictures upload failed")
    if (!videosUpload) throw new apiError("videos upload failed")

    const createProd = await Product.create({
      name,
      description,
      inStock,
      price,
      quality,
      category,
      pictures: picturesUpload.url || "",
      videos: videosUpload.url || "",
      createdBy: theFarm._id,
    })

    const thisProduct = await Product.findById(createProd._id)

    if (!thisProduct) throw new apiError(500, "Error creating product")

    theFarm.products.push(thisProduct._id);
    await theFarm.save();

    console.log("Product Created Successfully", thisProduct)

    return res
      .status(200)
      .json(new apiResponse(200, thisProduct, "Product created successfully"))
  } catch (error) {
    console.log(error)
  }
})

const exploreProducts = asyncHandler(async(req, res) => {

  const products = await Product.find()

  console.log(products)

  return res
  .status(200)
  .json(
    new apiResponse(200, {}, 'all products fetched')
  )

})

const readProduct = asyncHandler(async(req, res) => {

  const {id} = req.params

  const product = await Product.findById(id)

  console.log(product)

  return res
  .status(200)
  .json(
    new apiResponse(200, product, 'product fetched successfully')
  )

})

const changePrice = asyncHandler(async(req, res) => {

  try {
    
    const {newPrice} = req.body
    const {productid} = req.params

    const updatedProduct = await Product.findByIdAndUpdate(productid, {
      $set: {
        price: newPrice
      }
    }, {new: true})

    console.log(updatedProduct)

    return res
    .status(200)
    .json(
      new apiResponse(200, updatedProduct, 'price updated successfully')
    )

  } catch (error) {
    console.log(error)
  }

})

const deleteProduct = asyncHandler(async(req, res) => {

  try {
    
    const {productid, farmid} = req.params

    await Product.findByIdAndDelete(productid)
    await Farm.findById

    console.log('Product deleted successfully')

    return res
    .status(200)
    .json(
      new apiResponse(200, {}, 'product deleted successfully')
    )

  } catch (error) {
    console.log(error)
  }

})

export {
  createProduct,
  exploreProducts,
  readProduct,
  changePrice,
  deleteProduct
}
