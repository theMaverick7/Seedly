import { Router } from "express";
import multer from "multer";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validator } from "../middlewares/validator.middleware.js";

import {
    createProduct,
    deleteProduct,
    editProduct,
} from "../controllers/product.controllers.js";
import {
    createFarm,
    deleteFarm,
    editFarm,
} from "../controllers/farm.controllers.js";
import {
    createFarmowner,
    readFarmowner,
    loginFarmowner,
    logoutFarmowner,
    refreshAccessToken,
    changeUsername,
    changeFullname,
    changeEmail,
    changePassword,
    changeAvatar,
    deleteAvatar,
    deleteFarmowner,
} from "../controllers/farmowner.controllers.js";

import {
    updateUsernameSchema,
    updatePasswordSchema,
    updateEmailSchema,
    updateFullnameSchema,
} from "../../models/joiSchemas/sharedSchemas.js";
import {
    fileSchema,
    loginSchema,
    createJoiSchema,
} from "../../models/joiSchemas/sharedSchemas.js";
import {
    farmCreateSchema,
    farmEditSchema,
} from "../../models/joiSchemas/farm.joiSchema.js";
import {
    productCreateSchema,
    productEditSchema,
} from "../../models/joiSchemas/product.joiSchema.js";

const router = Router();

const farmownerFile = upload.single("avatar");

const farmFiles = upload.fields([
    { name: "pictures", maxCount: 3 },
    { name: "videos", maxCount: 3 },
]);

const productFiles = upload.fields([
    { name: "pictures", maxCount: 3 },
    { name: "videos", maxCount: 3 },
]);

// Register & Login
router.post("/create", farmownerFile, validator(createJoiSchema), createFarmowner);
router.post("/login", validator(loginSchema), loginFarmowner);

// Token & Logout
router.post("/newtoken", refreshAccessToken);
router.post("/logout", verifyJWT, logoutFarmowner);

// Farmowner Read
router.get("/read", verifyJWT, readFarmowner);

// Farmowner Edit
router.patch("/edit/username", verifyJWT, validator(updateUsernameSchema), changeUsername);
router.patch("/edit/email", verifyJWT, validator(updateEmailSchema), changeEmail);
router.patch("/edit/fullname", verifyJWT, validator(updateFullnameSchema), changeFullname);
router.patch("/edit/password", verifyJWT, validator(updatePasswordSchema), changePassword);
router.patch("/edit/avatar", verifyJWT, farmownerFile, validator(null), changeAvatar);

// Farm Edit
router.patch("/farms/:farmid/edit", verifyJWT, validator(farmEditSchema), editFarm);

// Product Edit
router.patch(
    "/farms/:farmid/products/:productid/edit",
    verifyJWT,
    productFiles,
    validator(productEditSchema),
    editProduct
);

// Farmowner Delete
router.delete("/delete", verifyJWT, deleteFarmowner);
router.delete("/delete/avatar", verifyJWT, deleteAvatar);

// Farm Delete
router.delete("/farms/:farmid/delete", verifyJWT, deleteFarm);

// Product Delete
router.delete("/farms/:farmid/products/:productid/delete", verifyJWT, deleteProduct);

// Farm Create
router.post(
    "/farms/create",
    verifyJWT,
    farmFiles,
    validator(farmCreateSchema),
    createFarm
);

// Product Create
router.post(
    "/farms/:farmid/products/create",
    verifyJWT,
    productFiles,
    validator(productCreateSchema),
    createProduct
);

export default router;