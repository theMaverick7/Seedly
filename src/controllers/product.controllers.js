import { asyncHandler } from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { Product } from "../../models/product.model.js"
import { uploadOnCloudinary, deleteFile } from "../utils/cloudinary.js"
import { Farm } from "../../models/farm.model.js"
import { FarmOwner } from "../../models/farmOwner.model.js"

const createProduct = asyncHandler(async (req, res) => {
  try {

    let data = []
    console.log(req.body)

    for(let key in req.body)
    data.push(key)

    const {farmownerid, farmid} = req.params;

    const theFarmowner = await FarmOwner.findById(req.farmowner._id);

    if(!theFarmowner) throw new apiError(500, 'farmowner not found');

    const fieldEmpty = data
    .map((key) => req.body[key])
    .some((elem) => elem.trim() === "")

    if (fieldEmpty) throw new apiError("all fields required")

    const existedProd = await Product.findOne({name: req.body.name})

    if (existedProd) throw new apiError("Product already exist")

    let localPicturesPath,
        localVideosPath,
        videosUpload

    if (req.files && Array.isArray(req.files.pictures) && req.files.pictures.length > 0)
    localPicturesPath = req.files.pictures[0].path

    if (req.files && Array.isArray(req.files.videos) && req.files.videos.length > 0)
    localVideosPath = req.files.videos[0].path

    if (!localPicturesPath) throw new apiError(400, "picture required")

    const theFarm = await Farm.findById(farmid)
    if (!theFarm) throw new apiError(500, "Farm not found")

    const picturesUpload = await uploadOnCloudinary(localPicturesPath)

    if(localVideosPath)
    videosUpload = await uploadOnCloudinary(localVideosPath)

    //if (!picturesUpload) throw new apiError("pictures upload failed")
    //if (!videosUpload) throw new apiError("videos upload failed")

    const createProd = await Product.create({
      ...req.body,
      pictures: {
        url: picturesUpload?.url || '',
        asset_id: picturesUpload?.asset_id || ''
      },
      videos: {
        url: videosUpload?.url || '',
        asset_id: videosUpload?.asset_id || ''
      },
      createdBy: theFarm._id
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
    
    const {farmid, productid} = req.params

    const deletedProd = await Product.findByIdAndDelete(productid)
    const updatedFarm = await Farm.findByIdAndUpdate(farmid, {
      $pull: {
        products: productid
      }
    }, {new: true})

    const assetId = deletedProd.pictures?.asset_id
    console.log(assetId)
    console.log(deletedProd.pictures)
    const deletedAsset = await deleteFile(assetId)


    console.log('Product deleted successfully')
    console.log(deletedAsset)
    return res
    .status(200)
    .json(
      new apiResponse(200, updatedFarm, 'product deleted successfully')
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
