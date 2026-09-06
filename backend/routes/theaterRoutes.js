import express from "express";
import { addTheater, getAllTheaters } from "../controllers/theaterController.js";
import { protectAdmin } from "../middleware/auth.js";

const theaterRouter = express.Router();

theaterRouter.get("/all", getAllTheaters);
theaterRouter.post("/add", protectAdmin, addTheater);

export default theaterRouter;
