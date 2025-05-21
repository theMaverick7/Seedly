import { Router } from "express";
import {
    exploreProducts,
    readProduct,
} from "../controllers/product.controllers.js";

const router = Router();

router.get("/", exploreProducts);
router.get("/:id", readProduct);

export default router;
