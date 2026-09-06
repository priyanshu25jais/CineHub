# 🎬 CineHub — Movie Ticket Booking Platform

CineHub is a full-stack movie ticket booking platform that allows users to discover movies, view showtimes, select seats, make online payments, and manage their bookings.

The platform also provides an admin dashboard for managing theaters, seat layouts, movies, shows, and bookings.

---

## 🚀 Features

### 👤 User Features

- User authentication with Clerk
- Browse currently available movies
- View movie details
- View movie ratings, genres, runtime, overview, and cast
- View available show dates and timings
- View theater information
- Dynamic theater-specific seat layouts
- Select and deselect seats
- View occupied seats in real time
- Different seat categories and pricing
- Secure online ticket payment with Razorpay
- View personal bookings
- Manage favorite movies
- Responsive UI for desktop and mobile devices

---

### 🎟️ Dynamic Seat Booking

CineHub supports customized seat layouts for different theaters.

Each theater can have its own:

- Number of rows
- Number of seats per row
- Seat category
- Total number of seats

Supported seat categories:

| Category | Price Multiplier |
|----------|------------------|
| Economy | ×1 |
| Standard | ×1.5 |
| Premium | ×2 |
| Recliner | ×3 |

The base ticket price is configured when an admin creates a show.

For example, if the base price is ₹200:

```text
Economy   → ₹200
Standard  → ₹300
Premium   → ₹400
Recliner  → ₹600