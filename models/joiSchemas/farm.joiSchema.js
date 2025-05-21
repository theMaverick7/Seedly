import Joi from 'joi'
import { fileSchema } from "../sharedSchemas.js"

export const farmCreateSchema = Joi.object({
    name: Joi.string()
        .max(15)
        .required(),

    description: Joi.string()
        .required(),

    location: Joi.string()
        .min(8)
        .max(30)
        .required(),

    pictures: [fileSchema],
    videos: [fileSchema]
})

export const farmEditSchema = Joi.object({
    name: farmJoiSchema.extract('name').required(),
    description: farmJoiSchema.extract('description').required(),
    location: farmJoiSchema.extract('location').required(),
    pictures: [fileSchema],
    videos: [fileSchema],
    removeAssets: {
        imagesIds: Joi.array().items(Joi.string()),
        videosIds: Joi.array().items(Joi.string())
    }
})