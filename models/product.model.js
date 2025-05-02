import mongoose from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"
import { cloudAsset, fileSchema } from "./sharedSchemas.js"
import Joi from "joi"

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

export const productJoiSchema = Joi.object({
        name: Joi.string()
            .max(15)
            .required(),

        description: Joi.string()
            .required(),

        inStock: Joi.boolean()
            .required(),

        price: Joi.number()
            .required(),

        quality: Joi.string()
            .required()
            .valid("premium", "standard", "economy"),

        category: Joi.string()
            .required()
            .valid("fruits", "vegetables", "dairy", "legumes", "meat"),

        pictures: [fileSchema],
        videos: [fileSchema]
})

mongoose.plugin(mongooseAggregatePaginate)

export const Product = mongoose.model("Product", productSchema)
