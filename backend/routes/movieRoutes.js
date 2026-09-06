import express from "express";
import { getAllMovies, getMovieById, getMovieTrailers } from "../controllers/movieController.js";

const router = express.Router();

router.get("/all", getAllMovies);
router.get("/:id/trailers", getMovieTrailers);
router.get("/:id", getMovieById);

export default router;
