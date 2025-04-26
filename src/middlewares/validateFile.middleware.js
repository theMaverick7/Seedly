import { apiError } from '../utils/apiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import {unlink} from 'fs/promises'

export const validate = (schema, fileSchema) => asyncHandler(async(req, res, next) => {
    
    try {

        // validating text fields
        const {value, error} = schema.validate(req.body)

        // validating file
        const {value: file, error: fileError} = fileSchema.validate(
            {
                path: req.file?.path || '',
                mimetype: req.file?.mimetype || '',
                size: req.file?.size || ''
            }
        )

        
        if (error) throw new apiError(400, error)
        if (fileError){
            await unlink(file.path)
            throw new apiError(400, fileError)
        }

        res.locals.validatedData = value
        res.locals.file = file
        next();    

    } catch (error) {
        console.log(error)
    }

})