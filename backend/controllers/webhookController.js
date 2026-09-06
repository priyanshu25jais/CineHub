import { Webhook } from "svix";
import User from "../models/User.js";

// POST /api/webhook/clerk — Sync Clerk users to MongoDB
export const clerkWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return res.status(500).json({ success: false, message: "Webhook secret not configured" });
    }

    const whook = new Webhook(webhookSecret);

    // req.body is the raw Buffer here (see express.raw middleware in server.js)
    const payload = req.body;
    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    let event;
    try {
      event = whook.verify(payload, headers);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).json({ success: false, message: "Invalid webhook signature" });
    }

    const { data, type } = event;

    switch (type) {
      case "user.created": {
        const existing = await User.findById(data.id);
        if (!existing) {
          await User.create({
            _id: data.id,
            name: `${data.first_name || ""} ${data.last_name || ""}`.trim() || "User",
            email: data.email_addresses?.[0]?.email_address || "",
            image: data.image_url || "",
          });
          console.log("User created:", data.email_addresses?.[0]?.email_address);
        }
        break;
      }

      case "user.updated": {
        await User.findByIdAndUpdate(
          data.id,
          {
            name: `${data.first_name || ""} ${data.last_name || ""}`.trim() || "User",
            email: data.email_addresses?.[0]?.email_address || "",
            image: data.image_url || "",
          },
          { new: true, upsert: true }
        );
        console.log("User updated:", data.id);
        break;
      }

      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        console.log("User deleted:", data.id);
        break;
      }

      default:
        console.log("Unhandled webhook event:", type);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
