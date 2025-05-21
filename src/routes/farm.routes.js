import { Router } from "express";
import { exploreFarms, readFarm } from "../controllers/farm.controllers.js";

const router = Router();

router.get("/", exploreFarms);
router.get("/:id", readFarm);

export default router;
