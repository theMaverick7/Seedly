import mongoose from "mongoose"
import Joi from 'joi'

export const cloudAssetSchema = new mongoose.Schema({
  _id: false,
  url: String,
  public_id: String
})

export const fileSchema = Joi.object({
  path: Joi.string()
        .allow(''),

  mimetype: Joi.string()
        .valid(
          'image/jpeg',
          'image/png',
          'video/mp4'
        )
        .messages({
            'string.valid': 'Only JPG,PNG & mp4 files are allowed.'
        })
        .allow(''),

  size: Joi.number()
        .max(60 * 1024 * 1024)
        .messages({
            'number.max': 'File size must be less than or equal to 60MB.'
        })
        .allow('')
})

export const loginSchema = Joi.object({
  identifier: Joi.alternatives().try(
    Joi.string()
    .alphanum()
    .min(5)
    .max(30)
    .lowercase()
    .label('username'),

    Joi.string()
    .email()
    .regex(/[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
    .label('email')
  ).required(),

  password: Joi.string()
    .min(6)
    .max(30)
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/)
    .required()
    .label('Password'),
})

export const createJoiSchema = Joi.object({
  username: Joi.string()
          .min(5)
          .max(30)
          .lowercase()
          .required(),

  fullname: Joi.string()
          .required(),

  password: Joi.string()
          .min(8)
          .max(30)
          .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/)
          .required(),

  email: Joi.string()
          .email()
          .regex(/[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
          .required(),

  avatar: fileSchema
})

export const updateUsernameSchema = Joi.object({
    username: createJoiSchema
        .extract('username')
        .required()
})

export const updatePasswordSchema = Joi.object({
    currentPassword: createJoiSchema
        .extract('password')
        .required(),

    newPassword: createJoiSchema
        .extract('password')
        .required()
})

export const updateEmailSchema = Joi.object({
    currentPassword: createJoiSchema
        .extract('password')
        .required(),

    newEmail: createJoiSchema
        .extract('email')
        .required()
})

export const updateFullnameSchema = Joi.object({
    currentPassword: createJoiSchema
        .extract('password')
        .required(),

    newFullname: createJoiSchema
        .extract('fullname')
        .required()
})