import { clerkClient } from "@clerk/express";

// Middleware to protect admin-only routes.
// Checks the logged-in Clerk user's privateMetadata.role === 'admin'
export const protectAdmin = async (req, res, next) => {
  try {
    const { userId } = req.auth();

    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authorized. Please login." });
    }

    const user = await clerkClient.users.getUser(userId);

    if (user.privateMetadata?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized as admin" });
    }

    next();
  } catch (error) {
    console.error(error.message);
    res.status(401).json({ success: false, message: "Not authorized" });
  }
};

// Middleware to protect logged-in-user-only routes.
export const requireUser = (req, res, next) => {
  try {
    const { userId } = req.auth();
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authorized. Please login." });
    }
    next();
  } catch (error) {
    console.error(error.message);
    res.status(401).json({ success: false, message: "Not authorized" });
  }
};
