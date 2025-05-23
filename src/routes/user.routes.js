import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validator } from "../middlewares/validator.middleware.js";
import {
    createJoiSchema,
    loginSchema,
    updateUsernameSchema,
    updatePasswordSchema,
    updateEmailSchema,
    updateFullnameSchema
} from "../../models/joiSchemas/sharedSchemas.js";
import {
    createUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    readUser,
    changeUsername,
    changePassword,
    changeEmail,
    changeFullname,
    changeAvatar,
    deleteAvatar,
    deleteUser,
} from "../controllers/user.controllers.js";

const router = Router();
const uploadFile = upload.single("avatar");

// Create
router.post("/create", uploadFile, validator(createJoiSchema), createUser);

// Update
router.patch("/edit/username", verifyJWT, validator(updateUsernameSchema), changeUsername);
router.patch("/edit/email", verifyJWT, validator(updateEmailSchema), changeEmail);
router.patch("/edit/fullname", verifyJWT, validator(updateFullnameSchema), changeFullname);
router.patch("/edit/password", verifyJWT, validator(updatePasswordSchema), changePassword);
router.patch("/edit/avatar", verifyJWT, uploadFile, validator(null), changeAvatar);

// Auth
router.post("/login", validator(loginSchema), loginUser);
router.post("/logout", verifyJWT, logoutUser);
router.post("/newToken", refreshAccessToken);

// Read
router.get("/read", verifyJWT, readUser);

// Delete
router.delete("/delete/avatar", verifyJWT, deleteAvatar);
router.delete("/delete", verifyJWT, deleteUser);

export default router;
