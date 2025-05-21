import mongoose from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"
import { cloudAsset } from "./sharedSchemas.js"

const reference = mongoose.Schema.Types.ObjectId

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    inStock: {
      type: Boolean,
      required: true,
    },
    pictures: [cloudAsset],
    videos: [cloudAsset],
    price: {
      type: Number,
      required: true,
    },
    quality: {
      type: String,
      enum: ["premium", "standard", "economy"],
      required: true,
    },
    category: {
      type: String,
      enum: ["fruits", "vegetables", "dairy", "legumes", "meat"],
      required: true,
    },
    createdBy: {
      type: reference,
      ref: "Farm",
    },
    reviews: [
      {
        type: reference,
        ref: "Review",
      },
    ],
  },
  { timestamps: true }
)

mongoose.plugin(mongooseAggregatePaginate)
export const Product = mongoose.model("Product", productSchema)
