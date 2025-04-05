import { Router } from "express"

import {
    exploreProducts,
    readProduct
} from "../controllers/product.controllers.js"

const router = Router()

router.route('/').get(exploreProducts)
router.route('/:id').get(readProduct)

export default router