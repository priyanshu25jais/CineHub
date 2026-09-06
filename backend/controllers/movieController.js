import Movie from "../models/Movie.js";
import Show from "../models/Show.js";
import { getTmdb } from "../config/tmdb.js";

// GET /api/movie/all — Fetch all movies from DB
export const getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    res.json({ success: true, movies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/movie/:id — Single movie + upcoming shows
export const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found" });
    }

    const shows = await Show.find({
      movie: movie._id,
      showDateTime: { $gte: new Date() },
    }).sort({ showDateTime: 1 });

    res.json({ success: true, movie, shows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/movie/:id/trailers — real trailers from TMDB for a stored movie
export const getMovieTrailers = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found" });
    }

    const { data } = await getTmdb().get(`/movie/${movie.tmdbId}/videos`);

    const trailers = (data.results || [])
      .filter((v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"))
      .map((v) => ({
        key: v.key,
        name: v.name,
        videoUrl: `https://www.youtube.com/watch?v=${v.key}`,
        image: `https://img.youtube.com/vi/${v.key}/maxresdefault.jpg`,
      }));

    res.json({ success: true, trailers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
