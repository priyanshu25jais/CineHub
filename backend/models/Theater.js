import mongoose from "mongoose";

const seatSchema = new mongoose.Schema(
  {
    row: {
      type: String,
      required: true,
    },

    seats: {
      type: Number,
      required: true,
      min: 1,
    },

    type: {
      type: String,
      enum: ["recliner", "premium", "standard", "economy"],
      required: true,
    },

    multiplier: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const theaterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    screens: {
      type: Number,
      required: true,
    },

    facilities: [
      {
        type: String,
      },
    ],

    image: {
      type: String,
      default: "",
    },

    seatLayout: {
      type: [seatSchema],
      default: [],
    },
    totalSeats: {
  type: Number,
  default: 0,
},
  },
  {
    timestamps: true,
  }
);

const Theater = mongoose.model("Theater", theaterSchema);

export default Theater;