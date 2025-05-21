import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Product } from "../../models/product.model.js";
import { Farm } from "../../models/farm.model.js";
import { FarmOwner } from "../../models/farmOwner.model.js";
import { uploadAndSaveCloudAssets } from "../utils/uploadAndSaveCloudAssets.js";
import { deleteFiles } from "../utils/cloudinary.js";

// Create Product
const createProduct = asyncHandler(async (req, res) => {
  const {
    validatedTextValues: userData,
    validatedPictures,
    validatedVideos,
  } = res.locals;
  const { farmownerid, farmid } = req.params;

  const theFarmowner = await FarmOwner.findById(req.farmowner._id);
  if (!theFarmowner) throw new apiError(500, "Farm owner not found");

  const existingProduct = await Product.findOne({ name: req.body.name });
  if (existingProduct) throw new apiError("Product already exists");

  const theFarm = await Farm.findById(farmid);
  if (!theFarm) throw new apiError(500, "Farm not found");

  const createProd = await Product.create({
    ...userData,
    createdBy: theFarm._id,
  });

  const thisProduct = await Product.findById(createProd._id);
  if (!thisProduct) throw new apiError(500, "Error creating product");

  if (validatedPictures)
    await uploadAndSaveCloudAssets(validatedPictures, thisProduct, "pictures");
  if (validatedVideos)
    await uploadAndSaveCloudAssets(validatedVideos, thisProduct, "videos");

  theFarm.products.push(thisProduct._id);
  await theFarm.save();

  console.log("Product Created Successfully", thisProduct);

  return res
    .status(200)
    .json(new apiResponse(200, thisProduct, "Product created successfully"));
});

// Explore Products
const exploreProducts = asyncHandler(async (_, res) => {
  const products = await Product.find();
  console.log(products);

  return res
    .status(200)
    .json(new apiResponse(200, products, "All products fetched"));
});

// Read Product
const readProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new apiError(404, "Product not found");

  console.log(product);

  return res
    .status(200)
    .json(new apiResponse(200, product, "Product fetched successfully"));
});

// Edit Product
const editProduct = asyncHandler(async (req, res) => {
  const {
    validatedTextValues: productData,
    validatedPictures,
    validatedVideos,
  } = res.locals;
  const { productid } = req.params;
  const { imagesIds = [], videosIds = [] } = productData.removeAssets || {};

  const foundProduct = await Product.findById(productid);
  if (!foundProduct) throw new apiError(500, "Product not found");

  if (imagesIds.length) {
    await Product.findByIdAndUpdate(
      foundProduct._id,
      { $pull: { pictures: { public_id: { $in: imagesIds } } } },
      { new: true }
    );
    await deleteFiles(imagesIds);
  }

  if (videosIds.length) {
    await Product.findByIdAndUpdate(
      foundProduct._id,
      { $pull: { videos: { public_id: { $in: videosIds } } } },
      { new: true }
    );
    await deleteFiles(videosIds, "video");
  }

  if (validatedPictures)
    await uploadAndSaveCloudAssets(validatedPictures, foundProduct, "pictures");
  if (validatedVideos)
    await uploadAndSaveCloudAssets(validatedVideos, foundProduct, "videos");

  const updatedProduct = await Product.findById(productid);

  console.log("Product updated successfully");

  res
    .status(200)
    .json(new apiResponse(200, updatedProduct, "Product updated successfully"));
});

// Delete Product
const deleteProduct = asyncHandler(async (req, res) => {
  const { farmid, productid } = req.params;

  const deletedProd = await Product.findByIdAndDelete(productid);
  if (!deletedProd) throw new apiError(404, "Product not found");

  const updatedFarm = await Farm.findByIdAndUpdate(
    farmid,
    { $pull: { products: productid } },
    { new: true }
  );

  await deleteFiles(deletedProd.pictures || []);
  await deleteFiles(deletedProd.videos || []);

  console.log("Product deleted successfully");

  return res
    .status(200)
    .json(new apiResponse(200, updatedFarm, "Product deleted successfully"));
});

export {
  createProduct,
  exploreProducts,
  readProduct,
  editProduct,
  deleteProduct,
};
