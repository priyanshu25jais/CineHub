import Razorpay from "razorpay";

// IMPORTANT: this is created lazily (only when actually needed), not at
// import time. ES module imports are all resolved *before* server.js gets a
// chance to run dotenv.config(), so creating the Razorpay client at the top
// of this file would always see undefined keys and crash on startup.
let razorpayInstance = null;

export const getRazorpay = () => {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
};
