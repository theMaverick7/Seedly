import Joi from 'joi'
import { fileSchema } from "../sharedSchemas.js"

export const productCreateSchema = Joi.object({
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
        .valid(
            "premium",
            "standard",
            "economy"
        ),

    category: Joi.string()
        .required()
        .valid(
            "fruits",
            "vegetables",
            "dairy",
            "legumes",
            "meat"
        ),

    pictures: [fileSchema],
    videos: [fileSchema]
})

export const productEditSchema = Joi.object({
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
        .valid(
            "premium",
            "standard",
            "economy"
        )
        .required(),

    category: Joi.string()
        .valid(
            "fruits",
            "vegetables",
            "dairy",
            "legumes",
            "meat"
        )
        .required(),

    pictures: [fileSchema],
    videos: [fileSchema],

    removeAssets: Joi.object({
        imagesIds: Joi.array()
            .items(
                Joi.string()
            ),
            
        videosIds: Joi.array()
            .items(
                Joi.string()
            )
    })
})