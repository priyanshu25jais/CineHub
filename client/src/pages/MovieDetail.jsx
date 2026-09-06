import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  Clock3,
  Heart,
  Play,
  Star,
} from "lucide-react";

import BlurCircle from "../components/BlurCircle";
import Loading from "../components/Loading";
import { useAppContext } from "../context/AppContext";
import { timeFormat } from "../lib/timeFormate";
import { assets } from "../assets/assets";

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    axios,
    getToken,
    user,
    fetchFavoriteMovies,
    favoriteMovies,
    image_base_url,
  } = useAppContext();

  const [movie, setMovie] = useState(null);
  const [dateTime, setDateTime] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

  const isFavorite = movie
    ? favoriteMovies.some(
        (item) => String(item._id) === String(movie._id)
      )
    : false;

  const fetchMovieDetail = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(`/api/movie/${id}`);

      if (data.success) {
        setMovie(data.movie);
      } else {
        toast.error(data.message || "Movie not found");
      }

      const showData = await axios.get(`/api/show/${id}`);

      if (showData.data.success) {
        setDateTime(showData.data.dateTime);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load movie details");
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async () => {
    try {
      if (!user) {
        toast.error("Please login to add movies to favorites");
        return;
      }

      const { data } = await axios.post(
        "/api/user/update-favorite",
        { movieId: id },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );

      if (data.success) {
        await fetchFavoriteMovies();
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  const selectShow = (date, show) => {
    navigate(`/movies/${movie._id}/${date}`);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    fetchMovieDetail();
    window.scrollTo(0, 0);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const dates = Object.keys(dateTime);

    if (dates.length > 0 && !selectedDate) {
      setSelectedDate(dates[0]);
    }
  }, [dateTime, selectedDate]);

  if (loading) {
    return <Loading />;
  }

  if (!movie) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 pt-20 text-center text-gray-400">
        Movie not found.
      </div>
    );
  }

  const dates = Object.keys(dateTime);
  const times = selectedDate ? dateTime[selectedDate] || [] : [];

  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : "";

  return (
    <div className="min-h-screen overflow-hidden pb-20">

      {/* =========================================================
          HERO / BACKDROP
      ========================================================== */}
      <section className="relative h-[62vh] min-h-[480px] w-full overflow-hidden">
        {/* Backdrop */}
        <img
          src={`${image_base_url}${movie.backdrop_path}`}
          alt={`${movie.title} backdrop`}
          className="h-full w-full object-cover"
        />

        {/* Cinematic overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/30 to-black/20" />
        <div className="absolute inset-0 bg-black/20" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute left-5 top-24 z-10 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-4 py-2.5 text-sm font-medium text-gray-200 backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:text-white md:left-12 lg:left-20"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        {/* Movie title inside hero on larger screens */}
        <div className="absolute bottom-12 left-6 right-6 md:left-16 lg:left-24 xl:left-36">
          <div className="max-w-4xl">
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <span className="h-1 w-8 rounded-full bg-primary" />
              Movie Details
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              {movie.title}
            </h1>
          </div>
        </div>
      </section>

      {/* =========================================================
          MAIN CONTENT
      ========================================================== */}
      <main className="relative -mt-4 px-6 md:px-12 lg:px-20 xl:px-36">
        <BlurCircle top="0" right="-100px" />

        {/* =====================================================
            MOVIE INFORMATION
        ====================================================== */}
        <section className="relative z-10 flex flex-col gap-8 md:flex-row">

          {/* Poster */}
          <div className="shrink-0">
            <div className="group relative mx-auto w-44 overflow-hidden rounded-2xl border border-white/10 bg-gray-900 shadow-2xl shadow-black/40 md:mx-0 md:w-56">
              <img
                src={`${image_base_url}${movie.poster_path}`}
                alt={`${movie.title} poster`}
                className="aspect-[2/3] w-full object-cover transition duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />
            </div>
          </div>

          {/* Information */}
          <div className="flex min-w-0 flex-1 flex-col justify-end pb-2 md:pb-1">

            {/* Title + favorite */}
            <div className="flex items-start justify-between gap-5">
              <div>
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  {movie.title}
                </h2>

                {movie.tagline && (
                  <p className="mt-2 text-sm italic text-gray-500 sm:text-base">
                    "{movie.tagline}"
                  </p>
                )}
              </div>

              {/* Favorite */}
              <button
                onClick={handleFavorite}
                aria-label={
                  isFavorite
                    ? "Remove from favorites"
                    : "Add to favorites"
                }
                title={
                  isFavorite
                    ? "Remove from favorites"
                    : "Add to favorites"
                }
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                  isFavorite
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-white/10 bg-white/5 text-gray-400 hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
                }`}
              >
                <Heart
                  className={`h-5 w-5 ${
                    isFavorite ? "fill-current" : ""
                  }`}
                />
              </button>
            </div>

            {/* Metadata */}
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-gray-300">
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-white">
                  {movie.vote_average
                    ? movie.vote_average.toFixed(1)
                    : "N/A"}
                </span>

                {movie.vote_count && (
                  <span className="text-gray-500">
                    ({movie.vote_count.toLocaleString()} votes)
                  </span>
                )}
              </div>

              {releaseYear && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{releaseYear}</span>
                </div>
              )}

              {movie.runtime && (
                <div className="flex items-center gap-1.5">
                  <Clock3 className="h-4 w-4 text-primary" />
                  <span>{timeFormat(movie.runtime)}</span>
                </div>
              )}
            </div>

            {/* Genres */}
            {movie.genres?.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-gray-300 backdrop-blur-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {/* Overview */}
            {movie.overview && (
              <p className="mt-6 max-w-3xl text-sm leading-7 text-gray-400 sm:text-base">
                {movie.overview}
              </p>
            )}
          </div>
        </section>

        {/* =====================================================
            CAST
        ====================================================== */}
        {movie.casts?.length > 0 && (
          <section className="relative z-10 mt-14">
            <div className="mb-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                The Stars
              </p>

              <h2 className="text-2xl font-bold text-white">
                Cast
              </h2>
            </div>

            <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-thin">
              {movie.casts.slice(0, 10).map((cast, index) => (
                <div
                  key={cast.id || index}
                  className="group flex w-20 shrink-0 flex-col items-center gap-3"
                >
                  <div className="overflow-hidden rounded-full border-2 border-gray-800 bg-gray-900 transition-all duration-300 group-hover:border-primary/50">
                    <img
                      src={
                        cast.profile_path
                          ? `${image_base_url}${cast.profile_path}`
                          : assets.profile
                      }
                      alt={cast.name}
                      loading="lazy"
                      className="h-16 w-16 object-cover transition duration-500 group-hover:scale-110"
                    />
                  </div>

                  <span
                    className="w-20 truncate text-center text-xs font-medium text-gray-400 transition group-hover:text-white"
                    title={cast.name}
                  >
                    {cast.name}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* =====================================================
            SHOW TIMES
        ====================================================== */}
        <section className="relative z-10 mt-16">

          {/* Heading */}
          <div className="mb-7">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Book Your Experience
            </p>

            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Select Date & Time
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Choose a showtime to continue to seat selection.
            </p>
          </div>

          {dates.length === 0 ? (
            /* No shows */
            <div className="rounded-2xl border border-dashed border-gray-800 bg-white/[0.02] px-6 py-12 text-center">
              <Calendar className="mx-auto mb-4 h-10 w-10 text-gray-600" />

              <h3 className="text-lg font-semibold text-gray-300">
                No upcoming shows
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                There are no upcoming shows scheduled for this movie yet.
                Please check again later.
              </p>
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-sm sm:p-7">

              {/* Dates */}
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />

                  <h3 className="text-sm font-semibold text-gray-200">
                    Available Dates
                  </h3>
                </div>

                <div className="flex flex-wrap gap-3">
                  {dates.map((date) => {
                    const active = selectedDate === date;

                    return (
                      <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-300 ${
                          active
                            ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                            : "border-white/10 bg-white/5 text-gray-400 hover:border-primary/30 hover:bg-primary/10 hover:text-white"
                        }`}
                      >
                        {new Date(date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Times */}
              {selectedDate && (
                <div className="mt-8 border-t border-white/10 pt-7">
                  <div className="mb-4 flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-primary" />

                    <h3 className="text-sm font-semibold text-gray-200">
                      Available Showtimes
                    </h3>
                  </div>

                  {times.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {times.map((show, index) => (
                        <button
                          key={show._id || index}
                          onClick={() => selectShow(selectedDate, show)}
                          className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-gray-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/20"
                        >
                          <Clock3 className="h-4 w-4 text-primary transition-colors group-hover:text-white" />

                          {new Date(show.time).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}

                          <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No showtimes available for this date.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* =====================================================
            BOOKING CTA
        ====================================================== */}
        {dates.length > 0 && selectedDate && times.length > 0 && (
          <section className="relative z-10 mt-12 overflow-hidden rounded-3xl border border-primary/20 bg-primary/[0.06] p-6 sm:p-8">
            <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Ready for your movie night?
                </h3>

                <p className="mt-1 text-sm text-gray-400">
                  Select a showtime above to choose your seats.
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <Play className="h-4 w-4 fill-current" />
                Choose a showtime
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default MovieDetail;