import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { createFarm } from "../controllers/farm.controllers.js";

const router = Router();

const uploadFiles = upload.fields([
    {
        name: 'pictures',
        maxCount: 3
    },
    {
        name: 'videos',
        maxCount: 3
    }
]);

router.route('/create').post(uploadFiles, createFarm);

export default router;