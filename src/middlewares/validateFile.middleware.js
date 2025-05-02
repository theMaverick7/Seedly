import { error } from 'console'
import { apiError } from '../utils/apiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { unlink } from 'fs/promises'

export const validate = (schema, fileSchema) => asyncHandler(async(req, res, next) => {

    console.log('req.file here')
    console.log(req.file)
    
    try {

        // validating text fields
        const { value: bodyValue, error: bodyError } = schema.validate(req.body)

        let validatedFile,
            validatedPictures, 
            validatedVideos,
            justError

        const validatefile = (elem) => {
            const {value, error: justError} = fileSchema.validate(
                {
                    path: elem.path,
                    mimetype: elem.mimetype,
                    size: elem.size
                }
            )
            return value
        }

        if (req.file){
            validatedFile = validatefile(req.file)
            console.log('hi i am validating file')
            console.log(validatedFile)
            res.locals.file = validatedFile
        }

        if(req.files){

        // for pictures
        validatedPictures = req.files.pictures?.map((picture) => validatefile(picture)) || []
        
        // for videos
        validatedVideos = req.files.videos?.map((video) => validatefile(video)) || []

        res.locals.validatedPictures = validatedPictures
        res.locals.validatedVideos = validatedVideos

        }

        if(justError) console.log(justError)


        // if (bodyError) throw new apiError(400, error)
        // if (fileError){
        //     await unlink(file.path)
        //     throw new apiError(400, fileError)
        // }

        res.locals.validatedBody = bodyValue
        // res.locals.videoFile = videoFile
        next();    

    } catch (error) {
        console.log(error)
    }

})


