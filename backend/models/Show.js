import mongoose from "mongoose";

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },

    theater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theater",
      required: true,
    },

    showDateTime: {
      type: Date,
      required: true,
    },

    showPrice: {
      type: Number,
      required: true,
    },

    occupiedSeats: {
      type: Object,
      default: {},
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

const Show = mongoose.model("Show", showSchema);

export default Show;