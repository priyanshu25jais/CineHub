import express from "express";
import { createBooking, getOccupiedSeats, verifyBooking } from "../controllers/bookingController.js";
import { requireUser } from "../middleware/auth.js";

const bookingRouter = express.Router();

bookingRouter.post("/create", requireUser, createBooking);
bookingRouter.post("/verify", requireUser, verifyBooking);
bookingRouter.get("/seats/:showId", getOccupiedSeats);

export default bookingRouter;
