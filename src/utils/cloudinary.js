import { v2 as Cloudinary } from "cloudinary";
import {unlink} from 'fs/promises';

Cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        const response = await Cloudinary.uploader.upload(localFilePath, {resource_type: 'auto'});
        console.log(`cloud upload successfull: ${response.url}`);
        await unlink(localFilePath);
        return response;
    } catch (error) {
        await unlink(localFilePath);
        return null;
    }
}

const deleteFile = async(asset_id) => {
    try {
       if(!asset_id) return null
       const response = await Cloudinary.uploader.destroy(asset_id, {resource_type: auto})
       console.log('File deleted successfully')
       return response
    } catch (error) {
        console.log(error)
        return null
    }
}

export {uploadOnCloudinary, deleteFile};