import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();



router.route('/create').post(uploadFiles);

export default router;