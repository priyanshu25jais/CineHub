import crypto from "crypto";
import Show from "../models/Show.js";
import Booking from "../models/Booking.js";
import { getRazorpay } from "../config/razorpay.js";

// Calculate price based on the theater's seat layout
const getSeatPrice = (seat, basePrice, seatLayout) => {
  const row = seat.charAt(0).toUpperCase();

  const rowConfig = seatLayout.find(
    (item) => String(item.row).toUpperCase() === row
  );

  const multiplier = Number(rowConfig?.multiplier || 1);

  return basePrice * multiplier;
};

// Calculate complete booking amount
const calculateTotalAmount = (
  selectedSeats,
  basePrice,
  seatLayout
) => {
  return selectedSeats.reduce((total, seat) => {
    return total + getSeatPrice(seat, basePrice, seatLayout);
  }, 0);
};

// Check whether selected seats are available
const checkSeatAvailability = async (showId, selectedSeats) => {
  try {
    const showData = await Show.findById(showId);

    if (!showData) {
      return false;
    }

    const occupiedSeats = showData.occupiedSeats || {};

    const isAnySeatTaken = selectedSeats.some(
      (seat) => occupiedSeats[seat]
    );

    return !isAnySeatTaken;
  } catch (error) {
    console.log(error.message);
    return false;
  }
};

// POST /api/booking/create
export const createBooking = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { showId, selectedSeats } = req.body;

    if (
      !showId ||
      !Array.isArray(selectedSeats) ||
      selectedSeats.length === 0
    ) {
      return res.json({
        success: false,
        message: "showId and selectedSeats are required",
      });
    }

    // Remove duplicate seats
    const uniqueSeats = [...new Set(selectedSeats)];

    // Check seat availability
    const isAvailable = await checkSeatAvailability(
      showId,
      uniqueSeats
    );

    if (!isAvailable) {
      return res.json({
        success: false,
        message: "One or more selected seats are already occupied.",
      });
    }

    // Get show details with movie and theater
    const showData = await Show.findById(showId)
      .populate("movie")
      .populate("theater");

    if (!showData) {
      return res.json({
        success: false,
        message: "Show not found",
      });
    }

    // Get theater seat layout
    const seatLayout = showData.theater?.seatLayout || [];

    if (seatLayout.length === 0) {
      return res.json({
        success: false,
        message: "This theater does not have a configured seat layout.",
      });
    }

    // Calculate price using theater seat categories
    const amount = calculateTotalAmount(
      uniqueSeats,
      showData.showPrice,
      seatLayout
    );

    // Create pending booking
    const booking = await Booking.create({
      user: userId,
      show: showId,
      amount,
      bookedSeats: uniqueSeats,
      isPaid: false,
    });

    // Reserve selected seats
    const occupiedSeats = {
      ...(showData.occupiedSeats || {}),
    };

    uniqueSeats.forEach((seat) => {
      occupiedSeats[seat] = userId;
    });

    showData.occupiedSeats = occupiedSeats;
    showData.markModified("occupiedSeats");

    await showData.save();

    // Check Razorpay configuration
    const razorpayConfigured =
      process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_SECRET &&
      !process.env.RAZORPAY_KEY_ID.includes("xxxx");

    // If Razorpay is not configured
    if (!razorpayConfigured) {
      booking.isPaid = true;

      await booking.save();

      return res.json({
        success: true,
        paymentRequired: false,
        message:
          "Booking confirmed (Razorpay not configured, skipping payment).",
        booking,
      });
    }

    // Create Razorpay order
    const order = await getRazorpay().orders.create({
      amount: Math.round(amount * 100),
      currency: process.env.CURRENCY || "INR",
      receipt: String(booking._id),
    });

    // Save Razorpay order ID
    booking.razorpayOrderId = order.id;

    await booking.save();

    res.json({
      success: true,
      paymentRequired: true,
      key: process.env.RAZORPAY_KEY_ID,
      order,
      bookingId: booking._id,
      amount,
    });
  } catch (error) {
    console.log(error.message);

    res.json({
      success: false,
      message: error.message,
    });
  }
};

// POST /api/booking/verify
export const verifyBooking = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !bookingId
    ) {
      return res.json({
        success: false,
        message: "Missing payment verification details",
      });
    }

    // Generate expected Razorpay signature
    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    // Verify signature
    if (expectedSignature !== razorpay_signature) {
      return res.json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // Find booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.json({
        success: false,
        message: "Booking not found",
      });
    }

    // Prevent duplicate verification
    if (booking.isPaid) {
      return res.json({
        success: true,
        message: "Booking is already confirmed",
        booking,
      });
    }

    // Confirm booking
    booking.isPaid = true;

    await booking.save();

    res.json({
      success: true,
      message: "Payment verified, booking confirmed",
      booking,
    });
  } catch (error) {
    console.log(error.message);

    res.json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/booking/seats/:showId
export const getOccupiedSeats = async (req, res) => {
  try {
    const { showId } = req.params;

    const showData = await Show.findById(showId);

    if (!showData) {
      return res.json({
        success: false,
        message: "Show not found",
      });
    }

    const occupiedSeats = Object.keys(
      showData.occupiedSeats || {}
    );

    res.json({
      success: true,
      occupiedSeats,
    });
  } catch (error) {
    console.log(error.message);

    res.json({
      success: false,
      message: error.message,
    });
  }
};