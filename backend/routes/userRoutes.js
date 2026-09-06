import express from "express";
import { getFavorites, getUserBookings, updateFavorite } from "../controllers/userController.js";
import { requireUser } from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.get("/bookings", requireUser, getUserBookings);
userRouter.post("/update-favorite", requireUser, updateFavorite);
userRouter.get("/favorites", requireUser, getFavorites);

export default userRouter;
