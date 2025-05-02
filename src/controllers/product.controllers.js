import { asyncHandler } from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { Product } from "../../models/product.model.js"
import { uploadOnCloudinary, deleteFile } from "../utils/cloudinary.js"
import { Farm } from "../../models/farm.model.js"
import { FarmOwner } from "../../models/farmOwner.model.js"

const createProduct = asyncHandler(async (req, res) => {
  try {

    const userData = res.locals.validatedBody
    const validatedPictures = res.locals.validatedPictures
    const validatedVideos = res.locals.validatedVideos

    console.log('coming from product controller')
    console.log(userData, validatedPictures, validatedVideos)

    const picturesPaths = []
    const videosPaths = []

    validatedPictures.forEach((picture) => picturesPaths.push(picture.path))
    validatedVideos.forEach((video) => videosPaths.push(video.path))

    console.log(picturesPaths, videosPaths)

    const {farmownerid, farmid} = req.params;

    const theFarmowner = await FarmOwner.findById(req.farmowner._id);

    if(!theFarmowner) throw new apiError(500, 'farmowner not found');

    const existedProd = await Product.findOne({name: req.body.name})

    if (existedProd) throw new apiError("Product already exist")

    const theFarm = await Farm.findById(farmid)
    if (!theFarm) throw new apiError(500, "Farm not found")

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

    const createProd = await Product.create({
      ...req.body,
      createdBy: theFarm._id
    })

    const thisProduct = await Product.findById(createProd._id)

    if (!thisProduct) throw new apiError(500, "Error creating product")

    promised1.forEach((obj) => {
            thisProduct.pictures.push({
                url: obj.url,
                asset_id: obj.asset_id
            })
        })

        promised2.forEach((obj) => {
            thisProduct.videos.push({
                url: obj.url,
                asset_id: obj.asset_id
            })
        })

    theFarm.products.push(thisProduct._id);
    await theFarm.save();
    await thisProduct.save()

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
