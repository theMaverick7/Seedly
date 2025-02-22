import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { registerUser } from "../controllers/user.controllers.js";

const router = Router();

const uploadFiles = upload.fields([
    {
        name: 'avatar',
        maxCount: 1
    }
]);

router.route('/register').post(uploadFiles, registerUser);

export default router;