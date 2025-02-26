import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { registerFarmowner } from "../controllers/farmowner.controllers.js";
import { createProduct } from "../controllers/product.controllers.js";

const router = Router();

const farmownerFiles = upload.fields([
    {
        name: 'avatar',
        maxCount: 1
    }
]);

const productFiles = upload.fields([
    {
        name: 'pictures',
        maxCount: 3
    },
    {
        name: 'videos',
        maxCount: 3
    }
]);

router.route('/register').post(farmownerFiles, registerFarmowner);
router.route('/farms/:id/products/create').post(productFiles, createProduct);

export default router;