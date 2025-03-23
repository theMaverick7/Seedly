import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { registerFarmowner, readFarmowner, loginFarmowner, logoutFarmowner } from "../controllers/farmowner.controllers.js";
import { createProduct } from "../controllers/product.controllers.js";
import { createFarm } from "../controllers/farm.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

const farmownerFiles = upload.fields([
    {
        name: 'avatar',
        maxCount: 1
    }
]);

const farmFiles = upload.fields([
    {
        name: 'pictures',
        maxCount: 3
    },
    {
        name: 'videos',
        maxCount: 3
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

// create routes
router.route('/register').post(farmownerFiles, registerFarmowner);
router.route('/:id/farms/create').post(farmFiles, createFarm);
router.route('/:farmownerid/farms/:farmid/products/create').post(productFiles, createProduct);

// login route
router.route('/login').post(loginFarmowner);

// logout route
router.route('/logout').post(verifyJWT, logoutFarmowner);

// read routes
router.route('/:id').get(readFarmowner);

export default router;