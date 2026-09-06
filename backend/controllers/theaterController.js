import Theater from "../models/Theater.js";

// GET /api/theater/all
export const getAllTheaters = async (req, res) => {
  try {
    const theaters = await Theater.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      theaters,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// POST /api/theater/add — Admin only
export const addTheater = async (req, res) => {
  try {
    const {
      name,
      address,
      city,
      screens,
      facilities,
      image,
      seatLayout,
    } = req.body;

    if (!name || !address || !city || !screens) {
      return res.status(400).json({
        success: false,
        message: "name, address, city and screens are required",
      });
    }

    if (!Array.isArray(seatLayout) || seatLayout.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one seat row is required",
      });
    }

    const multipliers = {
      recliner: 3,
      premium: 2,
      standard: 1.5,
      economy: 1,
    };

    const normalizedSeatLayout = seatLayout.map((row) => {
      const type = String(row.type || "economy").toLowerCase();

      return {
        row: String(row.row).toUpperCase(),
        seats: Number(row.seats),
        type,
        multiplier: multipliers[type] ?? 1,
      };
    });

    const invalidRow = normalizedSeatLayout.find(
      (row) =>
        !row.row ||
        !Number.isInteger(row.seats) ||
        row.seats < 1 ||
        !multipliers[row.type]
    );

    if (invalidRow) {
      return res.status(400).json({
        success: false,
        message: "Invalid seat layout configuration",
      });
    }

    const totalSeats = normalizedSeatLayout.reduce(
      (total, row) => total + row.seats,
      0
    );

    if (totalSeats <= 0) {
      return res.status(400).json({
        success: false,
        message: "Theater must have at least one seat",
      });
    }

    const theater = await Theater.create({
      name: name.trim(),
      address: address.trim(),
      city: city.trim(),
      screens: Number(screens),
      facilities: Array.isArray(facilities) ? facilities : [],
      image: image || "",
      seatLayout: normalizedSeatLayout,
      totalSeats,
    });

    res.json({
      success: true,
      message: "Theater added successfully",
      theater,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};