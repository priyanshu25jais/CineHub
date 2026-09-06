import Movie from "../models/Movie.js";
import Show from "../models/Show.js";
import Theater from "../models/Theater.js";
import { getTmdb } from "../config/tmdb.js";

// GET /api/show/now-playing
// Admin: get now-playing movies from TMDB
export const getNowPlayingMovies = async (req, res) => {
  try {
    const { data } = await getTmdb().get("/movie/now_playing");

    res.json({
      success: true,
      movies: data.results,
    });
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// POST /api/show/add
// Admin: add show(s) for a movie and theater
//
// Body:
// {
//   movieId,
//   theaterId,
//   showsInput: [{ date, time: [] }],
//   showPrice
// }
export const addShow = async (req, res) => {
  try {
    const {
      movieId,
      theaterId,
      showsInput,
      showPrice,
    } = req.body;

    // Validate basic fields
    if (
      !movieId ||
      !theaterId ||
      !Array.isArray(showsInput) ||
      showsInput.length === 0 ||
      !showPrice ||
      Number(showPrice) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "movieId, theaterId, showsInput and valid showPrice are required",
      });
    }

    // Check theater
    const theater = await Theater.findById(theaterId);

    if (!theater) {
      return res.status(404).json({
        success: false,
        message: "Theater not found",
      });
    }

    // Check theater has a seat layout
    if (
      !Array.isArray(theater.seatLayout) ||
      theater.seatLayout.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This theater does not have a seat layout configured",
      });
    }

    // Calculate total seats from theater layout
    const totalSeats = theater.seatLayout.reduce(
      (total, row) =>
        total + Number(row.seats || 0),
      0
    );

    if (totalSeats <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "The selected theater has no valid seats",
      });
    }

    // Find existing movie
    // movieId here is the TMDB movie ID
    let movie = await Movie.findOne({
      tmdbId: movieId,
    });

    // If movie does not exist, fetch from TMDB
    if (!movie) {
      const [
        movieDetailsResponse,
        movieCreditsResponse,
      ] = await Promise.all([
        getTmdb().get(`/movie/${movieId}`),
        getTmdb().get(`/movie/${movieId}/credits`),
      ]);

      const movieApiData =
        movieDetailsResponse.data;

      const movieCreditsData =
        movieCreditsResponse.data;

      const movieDetails = {
        tmdbId: movieId,

        title: movieApiData.title,

        overview: movieApiData.overview,

        poster_path:
          movieApiData.poster_path,

        backdrop_path:
          movieApiData.backdrop_path,

        genres: movieApiData.genres,

        casts: (
          movieCreditsData.cast || []
        )
          .slice(0, 20)
          .map((c) => ({
            name: c.name,
            profile_path: c.profile_path,
          })),

        release_date:
          movieApiData.release_date,

        original_language:
          movieApiData.original_language,

        tagline:
          movieApiData.tagline || "",

        vote_average:
          movieApiData.vote_average,

        vote_count:
          movieApiData.vote_count,

        runtime:
          movieApiData.runtime,
      };

      movie = await Movie.create(
        movieDetails
      );
    }

    // Create shows
    const showsToCreate = [];

    showsInput.forEach((show) => {
      const showDate = show.date;

      (show.time || []).forEach((time) => {
        const dateTimeString = `${showDate}T${time}`;

        showsToCreate.push({
          movie: movie._id,

          theater: theater._id,

          showDateTime:
            new Date(dateTimeString),

          showPrice:
            Number(showPrice),

          occupiedSeats: {},

          totalSeats,
        });
      });
    });

    if (showsToCreate.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No valid showtimes were provided",
      });
    }

    await Show.insertMany(
      showsToCreate
    );

    res.json({
      success: true,
      message: "Show(s) added successfully",
      totalShows: showsToCreate.length,
      totalSeats,
      theater: theater.name,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/show/all
// Get all unique movies that have an upcoming show
export const getShows = async (req, res) => {
  try {
    const shows = await Show.find({
      showDateTime: {
        $gte: new Date(),
      },
    })
      .populate("movie")
      .populate("theater")
      .sort({
        showDateTime: 1,
      });

    // One card per movie
    const uniqueMoviesMap = new Map();

    shows.forEach((show) => {
      if (
        show.movie &&
        !uniqueMoviesMap.has(
          String(show.movie._id)
        )
      ) {
        uniqueMoviesMap.set(
          String(show.movie._id),
          show.movie
        );
      }
    });

    res.json({
      success: true,
      shows: Array.from(
        uniqueMoviesMap.values()
      ),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/show/:movieId
// Get upcoming shows for a movie grouped by date
export const getShow = async (req, res) => {
  try {
    const { movieId } = req.params;

    const movie = await Movie.findById(
      movieId
    );

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    const shows = await Show.find({
      movie: movieId,

      showDateTime: {
        $gte: new Date(),
      },
    })
      .populate("theater")
      .sort({
        showDateTime: 1,
      });

    const dateTime = {};

    shows.forEach((show) => {
      const date =
        show.showDateTime
          .toISOString()
          .split("T")[0];

      if (!dateTime[date]) {
        dateTime[date] = [];
      }

      dateTime[date].push({
        time: show.showDateTime,

        showId: show._id,

        showPrice: show.showPrice,

        theater: show.theater
          ? {
              _id: show.theater._id,
              name: show.theater.name,
              address: show.theater.address,
              city: show.theater.city,
              seatLayout:
                show.theater.seatLayout,
              totalSeats:
                show.theater.totalSeats,
            }
          : null,

        totalSeats: show.totalSeats,
      });
    });

    res.json({
      success: true,
      movie,
      dateTime,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};