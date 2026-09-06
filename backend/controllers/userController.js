import Booking from "../models/Booking.js";
import { clerkClient } from "@clerk/express";
import Movie from "../models/Movie.js";

// GET /api/user/bookings
export const getUserBookings = async (req, res) => {
  try {
    const { userId } = req.auth();

    const bookings = await Booking.find({ user: userId })
      .populate({
        path: "show",
        populate: { path: "movie" },
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// POST /api/user/update-favorite — toggle a movie in Clerk user's favorites metadata
export const updateFavorite = async (req, res) => {
  try {
    const { movieId } = req.body;
    const { userId } = req.auth();

    if (!movieId) {
      return res.json({ success: false, message: "movieId is required" });
    }

    const user = await clerkClient.users.getUser(userId);
    const favorites = user.privateMetadata?.favorites || [];

    let updatedFavorites;
    if (favorites.includes(movieId)) {
      updatedFavorites = favorites.filter((item) => item !== movieId);
    } else {
      updatedFavorites = [...favorites, movieId];
    }

    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: { ...user.privateMetadata, favorites: updatedFavorites },
    });

    res.json({
      success: true,
      message: "Favorite updated successfully.",
    });
  } catch (error) {
    console.error(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/user/favorites
export const getFavorites = async (req, res) => {
  try {
    const { userId } = req.auth();
    const user = await clerkClient.users.getUser(userId);

    const favorites = user.privateMetadata?.favorites || [];

    const movies = await Movie.find({ _id: { $in: favorites } });

    res.json({
      success: true,
      movies,
    });
  } catch (error) {
    console.error(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};
