import { Router } from "express"
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { validate } from "../middlewares/validateFile.middleware.js"
import { joiSchema } from "../../models/farmOwner.model.js"
import { fileSchema } from "../../models/sharedSchemas.js"

import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    readUser,
    changeUsername,
    changePassword,
    changeAvatar
} from "../controllers/user.controllers.js";

const router = Router();

const uploadFile = upload.single('avatar')

// create routes
router.route('/register').post(uploadFile, validate(joiSchema, fileSchema), registerUser)

//updateroutes
router.route('/edit/username').patch(verifyJWT, changeUsername)
router.route('/edit/password').patch(verifyJWT, changePassword)
router.route('/edit/avatar').patch(verifyJWT, uploadFile, changeAvatar)

// login route
router.route('/login').post(loginUser)

// logout route
router.route('/logout').post(verifyJWT, logoutUser)

// refresh token route
router.route('/newToken').post(refreshAccessToken)

// read routes
router.route('/read').get(verifyJWT, readUser)

export default router;