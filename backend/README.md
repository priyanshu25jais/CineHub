# CineHub Backend API

## Tech Stack
- Node.js + Express.js
- MongoDB + Mongoose
- Clerk Authentication (user auth + admin role via privateMetadata)
- TMDB API (movies + trailers data — no dummy/mock data anywhere)

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure .env
```
PORT=5000
MONGODB_URI=         # MongoDB Atlas connection string
CLERK_SECRET_KEY=    # From Clerk Dashboard
CLERK_WEBHOOK_SECRET= # From Clerk Dashboard > Webhooks
TMDB_API_KEY=        # From themoviedb.org (v4 Read Access Token)
CURRENCY=INR
FRONTEND_URL=http://localhost:5173
```

### 3. Run server
```bash
npm run dev     # development (nodemon)
npm start       # production
```

---

## API Endpoints

### Movies
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/movie/all` | Public | Get all movies stored in DB |
| GET | `/api/movie/:id` | Public | Get one movie + its upcoming shows |
| GET | `/api/movie/:id/trailers` | Public | Get YouTube trailers for a movie (live from TMDB) |

### Shows
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/show/now-playing` | Admin | Now playing movies, live from TMDB |
| GET | `/api/show/all` | Public | All movies that currently have an upcoming show |
| GET | `/api/show/:movieId` | Public | Upcoming showtimes for one movie, grouped by date |
| POST | `/api/show/add` | Admin | Add show(s) for a movie (creates the Movie from TMDB the first time it's used) |

### Bookings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/booking/create` | User | Reserves seats for a show and creates a Razorpay order (or confirms the booking directly if Razorpay isn't configured yet) |
| POST | `/api/booking/verify` | User | Verifies the Razorpay payment signature and confirms the booking |
| GET | `/api/booking/seats/:showId` | Public | Get already-occupied seats for a show |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/is-admin` | Admin | Confirms the logged-in user is an admin |
| GET | `/api/admin/dashboard` | Admin | Dashboard stats (bookings, revenue, active shows, users) |
| GET | `/api/admin/all-shows` | Admin | All upcoming shows |
| GET | `/api/admin/all-bookings` | Admin | All bookings |

### User
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/user/bookings` | User | My bookings |
| GET | `/api/user/favorites` | User | My favorite movies |
| POST | `/api/user/update-favorite` | User | Toggle a movie in my favorites |

### Theaters
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/theater/all` | Public | List all theaters |
| POST | `/api/theater/add` | Admin | Add a new theater (also available from the admin panel → Add Theater) |

### Webhook
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/webhook/clerk` | Clerk user sync (create/update/delete) — keeps MongoDB `User` collection in sync with Clerk |

---

## Clerk Webhook Setup
1. Clerk Dashboard → Webhooks → Add Endpoint
2. URL: `https://your-domain.com/api/webhook/clerk`
3. Events: `user.created`, `user.updated`, `user.deleted`
4. Copy the Signing Secret → paste in `.env` as `CLERK_WEBHOOK_SECRET`

## Make a user an Admin
Clerk Dashboard → Users → select user → Private Metadata:
```json
{ "role": "admin" }
```

## Razorpay Payments
Bookings go through real Razorpay Checkout once you add live/test keys to `.env`:
```
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
```
Get these from the [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys). Until real keys are
added (the placeholders start with `rzp_test_xxxx`), the app automatically skips payment and confirms
bookings directly — so the whole flow still works end-to-end for local testing.
