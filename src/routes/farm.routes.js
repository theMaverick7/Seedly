import { Router } from "express"
import {
    exploreFarms,
    readFarm
} from "../controllers/farm.controllers.js"

const router = Router()

router.route('/').get(exploreFarms)
router.route('/:id').get(readFarm)


export default router