import { v2 as Cloudinary } from "cloudinary";
import { unlink } from "fs/promises";
import { apiError } from "../utils/apiError.js";

Cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    if (!localFilePath) return null;
    try {
        const response = await Cloudinary.uploader.upload(localFilePath, { resource_type: "auto" });
        console.log(`Cloud upload successful: ${response.url}`);
        await unlink(localFilePath);
        return response;
    } catch (error) {
        await unlink(localFilePath).catch(() => {});
        console.error("Cloudinary upload error:", error);
        return null;
    }
};

const deleteFile = async (public_id) => {
    if (!public_id) return null;
    try {
        console.log(`Attempting to delete file: ${public_id}`);
        const response = await Cloudinary.uploader.destroy(public_id);
        if (response.result === "not found") {
            throw new apiError(500, "Error deleting file from Cloudinary");
        }
        console.log("File deleted successfully");
        return response;
    } catch (error) {
        console.error("Cloudinary delete error:", error);
        return null;
    }
};

const deleteFiles = async (arr, type) => {
    if (!Array.isArray(arr) || arr.length === 0) return null;
    try {
        const responses = await Promise.all(
            arr.map((elem) =>
                Cloudinary.uploader.destroy(elem?.public_id || elem, { resource_type: type })
            )
        );
        console.log("Files deleted successfully");
        return responses;
    } catch (error) {
        throw new apiError(error.statusCode || 500, error.message || "Error deleting files");
    }
};

export { uploadOnCloudinary, deleteFile, deleteFiles };
