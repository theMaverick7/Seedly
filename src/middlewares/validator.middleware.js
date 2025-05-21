import { apiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { unlink } from 'fs/promises';
import { fileSchema } from '../../models/sharedSchemas.js';

// Validate a single file against the schema
const validateFile = async (file) => {
    try {
        const { value, error } = fileSchema.validate({
            path: file.path,
            mimetype: file.mimetype,
            size: file.size,
        });

        if (error) {
            await unlink(file.path);
            throw new apiError(400, error.message);
        }

        return value;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

// Validate an array of files
const validateFiles = async (files) => {
    return Promise.all(files.map(validateFile));
};

// Main validator middleware
export const validator = (schema) =>
    asyncHandler(async (req, res, next) => {
        // Parse removeAssets if present
        let removeAssets;
        try {
            removeAssets = req.body.removeAssets ? JSON.parse(req.body.removeAssets) : undefined;
        } catch (e) {
            throw new apiError(400, 'Invalid JSON in removeAssets');
        }

        // Validate text fields
        if (schema && Object.keys(req.body).length !== 0) {
            const { value: textValues, error: textError } = schema.validate({
                ...req.body,
                removeAssets,
            });

            if (textError) throw new apiError(400, textError.message);

            res.locals.validatedTextValues = textValues;
        }

        // Validate single file
        if (req.file) {
            const validatedFile = await validateFile(req.file);
            res.locals.validatedFile = validatedFile;
        }

        // Validate multiple files
        if (req.files && Object.keys(req.files).length !== 0) {
            const { pictures, videos } = req.files;

            if (pictures) {
                res.locals.validatedPictures = await validateFiles(Array.isArray(pictures) ? pictures : [pictures]);
            }

            if (videos) {
                res.locals.validatedVideos = await validateFiles(Array.isArray(videos) ? videos : [videos]);
            }
        }

        next();
    });