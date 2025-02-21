import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { registerFarmowner } from "../controllers/farmowner.controllers.js";

const router = Router();

const uploadFiles = upload.fields([
    {
        name: 'avatar',
        maxCount: 1
    }
]);

router.route('/register').post(uploadFiles, registerFarmowner);

export default router;