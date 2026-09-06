import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { clerkMiddleware } from "@clerk/express";
import connectDB from "./config/db.js";

import userRoutes from "./routes/userRoutes.js";
import movieRoutes from "./routes/movieRoutes.js";
import showRoutes from "./routes/showRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import theaterRoutes from "./routes/theaterRoutes.js";

// { override: true } makes sure the values in .env always win, even if a
// stale environment variable with the same name is already set on the
// machine/shell (a common cause of "it works in .env but the old value is
// still being used" bugs on Windows).
dotenv.config({ override: true });

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database
await connectDB();

// Middleware
app.use(cors());

// Clerk webhook needs the RAW request body to verify the signature,
// so this must be registered BEFORE express.json()
app.use("/api/webhook", express.raw({ type: "application/json" }), webhookRoutes);

app.use(express.json());
app.use(clerkMiddleware());

// API Routes
app.get("/", (req, res) => {
  res.send("Welcome to the Movie Booking API");
});

app.use("/api/movie", movieRoutes);
app.use("/api/show", showRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/theater", theaterRoutes);
app.use("/api/user", userRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
