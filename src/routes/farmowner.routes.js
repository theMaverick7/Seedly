import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { changePrice, createProduct, deleteProduct } from "../controllers/product.controllers.js";
import { createFarm, deleteFarm, updateDescription } from "../controllers/farm.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
    registerFarmowner,
    readFarmowner,
    loginFarmowner,
    logoutFarmowner,
    refreshAccessToken,
    changeUsername, 
    changePassword,
    changeAvatar
} from "../controllers/farmowner.controllers.js"

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
router.route('/:id/farms/create').post(verifyJWT, farmFiles, createFarm);
router.route('/farms/:farmid/products/create').post(verifyJWT, productFiles, createProduct);

// Patch routes
router.route('/edit/username').patch(verifyJWT, changeUsername)
router.route('/edit/password').patch(verifyJWT, changePassword)
router.route('/edit/avatar').patch(verifyJWT, farmownerFiles, changeAvatar)
router.route('/farms/:farmid/edit/description').patch(verifyJWT, updateDescription)
router.route('/farms/:farmid/products/:productid/edit/price').patch(verifyJWT, changePrice)

// login route
router.route('/login').post(loginFarmowner);

// logout route
router.route('/logout').post(verifyJWT, logoutFarmowner);

// new access token route
router.route('/newtoken').post(refreshAccessToken)

// read routes
router.route('/read').get(verifyJWT, readFarmowner);

// delete routes
router.route('/farms/:farmid/products/:productid/delete').delete(verifyJWT, deleteProduct)
router.route('/farms/:farmid/delete').delete(verifyJWT, deleteFarm)

export default router;