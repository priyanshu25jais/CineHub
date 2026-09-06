import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    _id: { type: String }, // Clerk user ID
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String, default: "" },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
