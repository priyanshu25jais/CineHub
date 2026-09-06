import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: { type: String, ref: "User", required: true }, // Clerk user ID
    show: { type: mongoose.Schema.Types.ObjectId, ref: "Show", required: true },
    bookedSeats: [{ type: String }],
    amount: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
    razorpayOrderId: { type: String },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
