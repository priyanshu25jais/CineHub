import React from "react";
import { ArrowRight, Film, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BlurCircle from "./BlurCircle";
import MovieCard from "./MovieCard";
import { useAppContext } from "../context/AppContext";

const FeaturedSection = () => {
  const navigate = useNavigate();
  const { shows } = useAppContext();

  const movies = shows?.slice(0, 4) || [];

  const goToMovies = () => {
    navigate("/movies");
    window.scrollTo(0, 0);
  };

  return (
    <section className="relative overflow-hidden px-6 py-20 sm:py-24 md:px-12 lg:px-20 xl:px-32">
      {/* Background glow */}
      <BlurCircle top="0" right="-100px" />

      <div className="relative z-10">
        {/* Section heading */}
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-1 w-8 rounded-full bg-primary" />

              <div className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                <Sparkles className="h-4 w-4" />
                Cinema
              </div>
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              Now Showing
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400 sm:text-base">
              Catch the latest movies currently playing at CineHub.
              Choose your favorite seats and book your tickets instantly.
            </p>
          </div>

          {/* Desktop View All */}
          <button
            onClick={goToMovies}
            className="group hidden shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-gray-300 backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:bg-primary/10 hover:text-primary hover:shadow-lg hover:shadow-primary/10 sm:flex"
          >
            View All
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>

        {/* Movie cards */}
        {movies.length > 0 ? (
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {movies.map((movie, index) => (
              <div
                key={movie._id}
                className="mx-auto w-full max-w-[290px] animate-fadeInUp"
                style={{
                  animationDelay: `${index * 0.08}s`,
                }}
              >
                <MovieCard {...movie} />
              </div>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-dashed border-gray-800 bg-white/[0.02] px-6 text-center backdrop-blur-sm">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <Film className="h-8 w-8 text-gray-500" />
            </div>

            <h3 className="text-lg font-semibold text-gray-300">
              No movies available
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
              New movies will appear here when shows are added from the
              CineHub admin dashboard.
            </p>

            <button
              onClick={goToMovies}
              className="mt-6 flex items-center gap-2 rounded-full border border-gray-700 bg-white/5 px-5 py-2.5 text-sm font-medium text-gray-300 transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
            >
              Browse Movies
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Mobile View All */}
        <div className="mt-10 flex justify-center sm:hidden">
          <button
            onClick={goToMovies}
            className="group flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-105 hover:bg-primary-dull hover:shadow-primary/30 active:scale-95"
          >
            View All Movies
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;