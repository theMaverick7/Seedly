import { v2 as Cloudinary } from "cloudinary";
import {unlink} from 'fs/promises';

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        const response = await Cloudinary.uploader.upload(localFilePath, {resource_type: 'auto'});
        console.log(`File uploaded successfully: ${response.url}`);
        await unlink(localFilePath);
        return response;
    } catch (error) {
        await unlink(localFilePath);
        return null;
    }
}

export {uploadOnCloudinary};