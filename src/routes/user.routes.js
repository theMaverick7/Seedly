import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validator } from "../middlewares/validator.middleware.js";
import { createJoiSchema } from "../../models/sharedSchemas.js";
import {
    createUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    readUser,
    changeUsername,
    changePassword,
    changeAvatar,
    deleteAvatar,
    deleteUser,
} from "../controllers/user.controllers.js";

const router = Router();
const uploadFile = upload.single("avatar");

// Register
router.post("/register", uploadFile, validator(createJoiSchema), createUser);

// Update
router.patch("/edit/username", verifyJWT, changeUsername);
router.patch("/edit/password", verifyJWT, changePassword);
router.patch("/edit/avatar", verifyJWT, uploadFile, changeAvatar);

// Auth
router.post("/login", loginUser);
router.post("/logout", verifyJWT, logoutUser);
router.post("/newToken", refreshAccessToken);

// Read
router.get("/read", verifyJWT, readUser);

// Delete
router.delete("/delete/avatar", verifyJWT, deleteAvatar);
router.delete("/delete", verifyJWT, deleteUser);

export default router;
