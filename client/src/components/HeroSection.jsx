import React from "react";
import {
  Calendar,
  Clock3,
  Star,
  Play,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const HeroSection = () => {
  const navigate = useNavigate();
  const { shows, image_base_url } = useAppContext();

  const featured = shows?.length > 0 ? shows[0] : null;

  const backdropUrl = featured?.backdrop_path
    ? `${image_base_url}${featured.backdrop_path}`
    : "/backgroundImage.png";

  const genres = (featured?.genres || [])
    .slice(0, 3)
    .map((genre) => genre.name)
    .join(" • ");

  const year = featured?.release_date
    ? new Date(featured.release_date).getFullYear()
    : "";

  const runtime = featured?.runtime
    ? `${Math.floor(featured.runtime / 60)}h ${
        featured.runtime % 60
      }m`
    : "";

  const rating = featured?.vote_average
    ? featured.vote_average.toFixed(1)
    : null;

  const openMovie = () => {
    if (!featured?._id) {
      navigate("/movies");
      return;
    }

    navigate(`/movies/${featured._id}`);
    window.scrollTo(0, 0);
  };

  return (
    <section className="relative flex min-h-[82vh] items-center overflow-hidden bg-black">

      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-[2000ms]"
        style={{
          backgroundImage: `url("${backdropUrl}")`,
        }}
      />

      {/* Cinematic overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/20" />

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-black/30" />

      {/* Extra left glow */}
      <div className="absolute left-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-primary/10 blur-[140px]" />

      {/* Content */}
      <div className="relative z-10 w-full px-6 pb-20 pt-32 sm:px-10 md:px-16 lg:px-28 xl:px-36">

        <div className="max-w-3xl">

          {/* Featured label */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md sm:text-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary shadow-[0_0_10px_rgba(248,69,101,0.8)]" />
            Featured Movie
          </div>

          {/* Movie title */}
          <h1 className="max-w-4xl text-5xl font-extrabold leading-[0.95] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
            {featured?.title || "Your next movie night starts here"}
          </h1>

          {/* Movie information */}
          {featured && (
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-gray-200 md:text-base">

              {genres && (
                <span className="font-medium">
                  {genres}
                </span>
              )}

              {year && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{year}</span>
                </div>
              )}

              {runtime && (
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-primary" />
                  <span>{runtime}</span>
                </div>
              )}

              {rating && (
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">
                    {rating}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <p className="mt-6 max-w-2xl text-sm leading-7 text-gray-300 sm:text-base md:text-lg">
            {featured?.overview ||
              "Discover the latest movies, choose your favorite seats, and book your tickets in just a few clicks."}
          </p>

          {/* CTA buttons */}
          <div className="mt-9 flex flex-wrap items-center gap-4">

            <button
              onClick={openMovie}
              className="
                group flex items-center gap-2
                rounded-full bg-primary
                px-7 py-3.5
                text-sm font-semibold text-white
                shadow-xl shadow-primary/20
                transition-all duration-300
                hover:-translate-y-0.5
                hover:scale-105
                hover:bg-primary-dull
                hover:shadow-primary/30
                active:scale-95
                sm:px-8 sm:py-4
              "
            >
              <Play className="h-4 w-4 fill-current" />

              Book Tickets

              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => {
                navigate("/movies");
                window.scrollTo(0, 0);
              }}
              className="
                flex items-center gap-2
                rounded-full
                border border-white/20
                bg-white/10
                px-7 py-3.5
                text-sm font-semibold text-white
                backdrop-blur-md
                transition-all duration-300
                hover:-translate-y-0.5
                hover:bg-white/20
                active:scale-95
                sm:px-8 sm:py-4
              "
            >
              Browse Movies
            </button>

          </div>

          {/* Small trust text */}
          <div className="mt-7 flex flex-wrap items-center gap-4 text-xs text-gray-400 sm:text-sm">
            <span>🎬 Latest releases</span>
            <span className="h-1 w-1 rounded-full bg-gray-600" />
            <span>💺 Choose your seats</span>
            <span className="h-1 w-1 rounded-full bg-gray-600" />
            <span>🔒 Secure checkout</span>
          </div>

        </div>
      </div>

      {/* Bottom fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black via-black/60 to-transparent" />

    </section>
  );
};

export default HeroSection;