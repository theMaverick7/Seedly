import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const uploadAndSaveCloudAssets = async (arr, doc, name) => {
    const uploads = await Promise.all(
        arr.map(elem => uploadOnCloudinary(elem.path))
    );

    uploads.forEach(({ url, public_id }) => {
        doc[name].push({ url, public_id });
    });

    await doc.save();
};
