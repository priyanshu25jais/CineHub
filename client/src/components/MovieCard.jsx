import React from "react";
import { ArrowRight, Clock3, StarIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const MovieCard = (movie) => {
  const navigate = useNavigate();
  const { image_base_url } = useAppContext();

  const goToDetail = () => {
    navigate(`/movies/${movie._id}`);
    window.scrollTo(0, 0);
  };

  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : "";

  const genres = (movie.genres || [])
    .slice(0, 2)
    .map((genre) => genre.name)
    .join(" • ");

  const runtime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : "";

  const rating = movie.vote_average
    ? movie.vote_average.toFixed(1)
    : "N/A";

  return (
    <article className="group w-full overflow-hidden rounded-2xl border border-white/10 bg-gray-900/70 shadow-xl shadow-black/20 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10">

      {/* Poster */}
      <div
        onClick={goToDetail}
        className="relative aspect-[2/3] cursor-pointer overflow-hidden bg-gray-900"
      >
        <img
          src={`${image_base_url}${movie.poster_path}`}
          alt={`${movie.title} poster`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />

        {/* Bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/10 opacity-80" />

        {/* Rating badge */}
        <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/70 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-md">
          <StarIcon className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          {rating}
        </div>

        {/* Hover details */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:opacity-100">
          <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-transform duration-300 group-hover:scale-100">
            View Details
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>

        {/* Movie title on poster */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-2 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <p className="truncate text-sm font-semibold text-white">
            {movie.title}
          </p>
        </div>
      </div>

      {/* Movie information */}
      <div className="p-4 sm:p-5">

        {/* Title */}
        <h3
          onClick={goToDetail}
          title={movie.title}
          className="cursor-pointer truncate text-base font-bold text-white transition-colors duration-300 hover:text-primary sm:text-lg"
        >
          {movie.title}
        </h3>

        {/* Metadata */}
        <div className="mt-2 flex min-h-[20px] items-center gap-2 overflow-hidden text-xs text-gray-400">
          {year && <span className="shrink-0">{year}</span>}

          {genres && (
            <>
              <span className="text-gray-600">•</span>
              <span className="truncate">{genres}</span>
            </>
          )}
        </div>

        {/* Runtime */}
        {runtime && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
            <Clock3 className="h-3.5 w-3.5" />
            <span>{runtime}</span>
          </div>
        )}

        {/* Bottom actions */}
        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            onClick={goToDetail}
            className="group/btn flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-105 hover:bg-primary-dull hover:shadow-primary/30 active:scale-95 sm:px-5"
          >
            Buy Tickets
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
          </button>

          {/* Rating */}
          <div className="flex items-center gap-1.5">
            <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-semibold text-gray-300">
              {rating}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default MovieCard;