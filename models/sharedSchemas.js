import mongoose from "mongoose"
import Joi from 'joi'

export const cloudAsset = new mongoose.Schema({
  _id: false,
  url: String,
  asset_id: String
})

export const fileSchema = Joi.object({
    path: Joi.string().allow(''),
    mimetype: Joi.string().valid('image/jpeg', 'image/png', 'video/mp4').messages({
      'string.valid': 'Only JPG and PNG files are allowed.',
    }).allow(''),
    size: Joi.number().max(10 * 1024 * 1024).messages({ // 2MB limit
      'number.max': 'File size must be less than or equal to 2MB.',
      'number.required': 'File size is required.',
    }).allow('')
  })
