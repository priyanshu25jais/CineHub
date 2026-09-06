import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  CheckIcon,
  XCircle as DeleteIcon,
  StarIcon,
  PlusIcon,
  Building2,
  Armchair,
  CalendarDays,
  Clock3,
} from "lucide-react";

import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import { kConverter } from "../../lib/kConverter";
import { useAppContext } from "../../context/AppContext";

const AddShows = () => {
  const {
    axios,
    getToken,
    image_base_url,
    currency,
  } = useAppContext();

  const [nowPlayingMovies, setNowPlayingMovies] =
    useState([]);

  const [theaters, setTheaters] = useState([]);

  const [loading, setLoading] = useState(true);

  const [selectedMovie, setSelectedMovie] =
    useState(null);

  const [selectedTheater, setSelectedTheater] =
    useState(null);

  const [showPrice, setShowPrice] = useState("");

  const [dateTimeSelection, setDateTimeSelection] =
    useState({});

  const [dateTimeInput, setDateTimeInput] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  /* =========================================================
     FETCH MOVIES + THEATERS
  ========================================================== */

  const fetchData = async () => {
    try {
      setLoading(true);

      const token = await getToken();

      const [moviesResponse, theatersResponse] =
        await Promise.all([
          axios.get("/api/show/now-playing", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          axios.get("/api/theater/all", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

      if (moviesResponse.data.success) {
        setNowPlayingMovies(
          moviesResponse.data.movies
        );
      } else {
        toast.error(
          moviesResponse.data.message ||
            "Failed to load movies"
        );
      }

      if (theatersResponse.data.success) {
        setTheaters(
          theatersResponse.data.theaters
        );
      } else {
        toast.error(
          theatersResponse.data.message ||
            "Failed to load theaters"
        );
      }
    } catch (error) {
      console.error(error);

      toast.error(
        "Failed to load movies and theaters"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =========================================================
     DATE / TIME
  ========================================================== */

  const handleDateTimeAdd = () => {
    if (!dateTimeInput) {
      return toast.error(
        "Please select a date and time"
      );
    }

    const [date, time] =
      dateTimeInput.split("T");

    if (!date || !time) {
      return toast.error(
        "Invalid date and time"
      );
    }

    setDateTimeSelection((prev) => {
      const times = prev[date] || [];

      if (times.includes(time)) {
        toast.error(
          "This showtime has already been added"
        );

        return prev;
      }

      return {
        ...prev,
        [date]: [...times, time].sort(),
      };
    });

    setDateTimeInput("");
  };

  const handleRemoveTime = (
    date,
    time
  ) => {
    setDateTimeSelection((prev) => {
      const updatedTimes =
        (prev[date] || []).filter(
          (t) => t !== time
        );

      const updated = {
        ...prev,
      };

      if (updatedTimes.length === 0) {
        delete updated[date];
      } else {
        updated[date] = updatedTimes;
      }

      return updated;
    });
  };

  /* =========================================================
     RESET
  ========================================================== */

  const resetForm = () => {
    setSelectedMovie(null);
    setSelectedTheater(null);
    setShowPrice("");
    setDateTimeSelection({});
    setDateTimeInput("");
  };

  /* =========================================================
     SUBMIT
  ========================================================== */

  const handleSubmit = async () => {
    try {
      if (!selectedMovie) {
        return toast.error(
          "Please select a movie"
        );
      }

      if (!selectedTheater) {
        return toast.error(
          "Please select a theater"
        );
      }

      if (
        !showPrice ||
        Number(showPrice) <= 0
      ) {
        return toast.error(
          "Please enter a valid show price"
        );
      }

      if (
        Object.keys(dateTimeSelection)
          .length === 0
      ) {
        return toast.error(
          "Please add at least one showtime"
        );
      }

      if (
        !selectedTheater.seatLayout ||
        selectedTheater.seatLayout.length === 0
      ) {
        return toast.error(
          "Selected theater does not have a seat layout"
        );
      }

      setSubmitting(true);

      const showsInput =
        Object.entries(
          dateTimeSelection
        ).map(([date, times]) => ({
          date,
          time: times,
        }));

      const { data } = await axios.post(
        "/api/show/add",
        {
          movieId: selectedMovie,
          theaterId:
            selectedTheater._id,
          showsInput,
          showPrice:
            Number(showPrice),
        },
        {
          headers: {
            Authorization:
              `Bearer ${await getToken()}`,
          },
        }
      );

      if (data.success) {
        toast.success(
          data.message ||
            "Shows added successfully"
        );

        resetForm();
      } else {
        toast.error(
          data.message ||
            "Failed to add shows"
        );
      }
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to add show"
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return <Loading />;
  }

  /* =========================================================
     SELECTED THEATER INFO
  ========================================================== */

  const totalSeats =
    selectedTheater?.seatLayout?.reduce(
      (total, row) =>
        total + Number(row.seats || 0),
      0
    ) || 0;

  return (
    <div className="pb-10">
      <Title text1="Add" text2="Shows" />

      {/* =====================================================
          STEP 1 — MOVIE
      ====================================================== */}

      <section className="mt-7 rounded-2xl border border-white/10 bg-gray-900/50 p-6 shadow-xl backdrop-blur-sm">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
              1
            </span>

            <div>
              <h2 className="text-lg font-bold text-white">
                Select Movie
              </h2>

              <p className="text-sm text-gray-500">
                Choose a movie currently playing.
              </p>
            </div>
          </div>
        </div>

        {nowPlayingMovies.length === 0 ? (
          <p className="text-sm text-gray-500">
            No movies returned from TMDB right now.
          </p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {nowPlayingMovies.map((movie) => {
              const isSelected =
                selectedMovie === movie.id;

              return (
                <div
                  key={movie.id}
                  onClick={() =>
                    setSelectedMovie(movie.id)
                  }
                  className={`group relative w-32 cursor-pointer overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                    isSelected
                      ? "scale-[1.03] border-primary shadow-lg shadow-primary/20"
                      : "border-transparent hover:-translate-y-1 hover:border-gray-700"
                  }`}
                >
                  <img
                    src={
                      image_base_url +
                      movie.poster_path
                    }
                    alt={movie.title}
                    loading="lazy"
                    className="h-44 w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  {isSelected && (
                    <div className="absolute right-2 top-2 rounded-full bg-primary p-1.5 shadow-lg">
                      <CheckIcon className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}

                  <div className="bg-gray-900 p-2.5">
                    <p
                      className="truncate text-xs font-semibold text-white"
                      title={movie.title}
                    >
                      {movie.title}
                    </p>

                    <div className="mt-1.5 flex items-center justify-between">
                      <p className="flex items-center gap-1 text-[11px] text-yellow-400">
                        <StarIcon className="h-3 w-3 fill-yellow-400" />

                        {movie.vote_average
                          ? movie.vote_average.toFixed(
                              1
                            )
                          : "N/A"}
                      </p>

                      <p className="text-[10px] text-gray-600">
                        {kConverter(
                          movie.vote_count
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* =====================================================
          STEP 2 — THEATER
      ====================================================== */}

      <section className="mt-7 rounded-2xl border border-white/10 bg-gray-900/50 p-6 shadow-xl backdrop-blur-sm">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
              2
            </span>

            <div>
              <h2 className="text-lg font-bold text-white">
                Select Theater
              </h2>

              <p className="text-sm text-gray-500">
                Choose where this movie will be shown.
              </p>
            </div>
          </div>
        </div>

        {theaters.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-700 px-6 py-10 text-center">
            <Building2 className="mx-auto mb-3 h-8 w-8 text-gray-600" />

            <p className="text-sm font-medium text-gray-400">
              No theaters available
            </p>

            <p className="mt-1 text-xs text-gray-600">
              Add a theater with a seat layout first.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {theaters.map((theater) => {
              const isSelected =
                selectedTheater?._id ===
                theater._id;

              const seats =
                theater.totalSeats ||
                theater.seatLayout?.reduce(
                  (total, row) =>
                    total +
                    Number(row.seats || 0),
                  0
                ) ||
                0;

              return (
                <button
                  key={theater._id}
                  type="button"
                  onClick={() =>
                    setSelectedTheater(theater)
                  }
                  className={`text-left rounded-2xl border p-5 transition-all duration-300 ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                      : "border-gray-800 bg-gray-800/20 hover:border-gray-600 hover:bg-gray-800/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          isSelected
                            ? "bg-primary text-white"
                            : "bg-white/5 text-gray-400"
                        }`}
                      >
                        <Building2 className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-white">
                          {theater.name}
                        </h3>

                        <p className="mt-1 truncate text-xs text-gray-500">
                          {theater.city}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <CheckIcon className="h-5 w-5 shrink-0 text-primary" />
                    )}
                  </div>

                  <p className="mt-4 line-clamp-2 text-xs leading-5 text-gray-500">
                    {theater.address}
                  </p>

                  <div className="mt-4 flex items-center gap-4 border-t border-gray-800 pt-4 text-xs">
                    <span className="flex items-center gap-1.5 text-gray-400">
                      <Armchair className="h-3.5 w-3.5 text-primary" />
                      {seats} seats
                    </span>

                    <span className="text-gray-700">
                      •
                    </span>

                    <span className="text-gray-500">
                      {theater.seatLayout?.length ||
                        0} rows
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Selected theater layout summary */}
        {selectedTheater && (
          <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs uppercase tracking-wider text-primary">
                  Selected Theater
                </p>

                <h3 className="mt-1 text-lg font-bold text-white">
                  {selectedTheater.name}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {selectedTheater.city}
                </p>
              </div>

              <div className="flex gap-6">
                <div>
                  <p className="text-xs text-gray-600">
                    Rows
                  </p>

                  <p className="mt-1 font-bold text-white">
                    {selectedTheater
                      .seatLayout?.length || 0}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-600">
                    Seats
                  </p>

                  <p className="mt-1 font-bold text-primary">
                    {totalSeats}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* =====================================================
          STEP 3 — PRICE
      ====================================================== */}

      <section className="mt-7 rounded-2xl border border-white/10 bg-gray-900/50 p-6 shadow-xl backdrop-blur-sm">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
              3
            </span>

            <div>
              <h2 className="text-lg font-bold text-white">
                Ticket Pricing
              </h2>

              <p className="text-sm text-gray-500">
                Set the base ticket price for this show.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-sm">
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Base Show Price
          </label>

          <div className="flex items-center rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-3 focus-within:border-primary">
            <span className="mr-3 text-gray-500">
              {currency}
            </span>

            <input
              type="number"
              min="1"
              value={showPrice}
              onChange={(e) =>
                setShowPrice(e.target.value)
              }
              placeholder="Enter base price"
              className="w-full bg-transparent text-sm text-white outline-none"
            />
          </div>

          {showPrice &&
            Number(showPrice) > 0 &&
            selectedTheater && (
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  ["Economy", 1],
                  ["Standard", 1.5],
                  ["Premium", 2],
                  ["Recliner", 3],
                ].map(([label, multiplier]) => (
                  <div
                    key={label}
                    className="rounded-lg border border-gray-800 bg-gray-800/30 p-3"
                  >
                    <p className="text-[10px] text-gray-500">
                      {label}
                    </p>

                    <p className="mt-1 text-sm font-bold text-white">
                      {currency}
                      {Number(showPrice) *
                        multiplier}
                    </p>
                  </div>
                ))}
              </div>
            )}
        </div>
      </section>

      {/* =====================================================
          STEP 4 — DATE & TIME
      ====================================================== */}

      <section className="mt-7 rounded-2xl border border-white/10 bg-gray-900/50 p-6 shadow-xl backdrop-blur-sm">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
              4
            </span>

            <div>
              <h2 className="text-lg font-bold text-white">
                Schedule Shows
              </h2>

              <p className="text-sm text-gray-500">
                Add one or more dates and showtimes.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

            <input
              type="datetime-local"
              value={dateTimeInput}
              onChange={(e) =>
                setDateTimeInput(e.target.value)
              }
              className="rounded-xl border border-gray-700 bg-gray-800/50 py-3 pl-10 pr-4 text-sm text-gray-300 outline-none transition focus:border-primary"
            />
          </div>

          <button
            type="button"
            onClick={handleDateTimeAdd}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-dull"
          >
            <PlusIcon className="h-4 w-4" />
            Add Showtime
          </button>
        </div>

        {/* Selected times */}
        {Object.keys(dateTimeSelection).length >
          0 && (
          <div className="mt-7">
            <div className="mb-4 flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-primary" />

              <p className="text-sm font-semibold text-gray-300">
                Selected Showtimes
              </p>
            </div>

            <div className="space-y-3">
              {Object.entries(
                dateTimeSelection
              ).map(([date, times]) => (
                <div
                  key={date}
                  className="rounded-xl border border-gray-800 bg-gray-800/20 p-4"
                >
                  <p className="mb-3 text-sm font-semibold text-white">
                    {new Date(
                      `${date}T00:00`
                    ).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {times.map((time) => (
                      <span
                        key={time}
                        className="flex items-center gap-2 rounded-full border border-gray-700 bg-gray-900 px-3 py-1.5 text-xs text-gray-300"
                      >
                        <Clock3 className="h-3 w-3 text-primary" />

                        {new Date(
                          `2000-01-01T${time}`
                        ).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveTime(
                              date,
                              time
                            )
                          }
                          className="ml-1 text-gray-500 transition hover:text-red-400"
                          aria-label="Remove showtime"
                        >
                          <DeleteIcon className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* =====================================================
          SUMMARY + SUBMIT
      ====================================================== */}

      <section className="mt-7 rounded-2xl border border-primary/20 bg-primary/[0.04] p-6">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Show Summary
            </p>

            <h2 className="mt-2 text-xl font-bold text-white">
              {selectedMovie
                ? nowPlayingMovies.find(
                    (movie) =>
                      movie.id ===
                      selectedMovie
                  )?.title
                : "No movie selected"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {selectedTheater
                ? selectedTheater.name
                : "No theater selected"}
            </p>

            <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
              <span>
                Seats:{" "}
                <strong className="text-gray-300">
                  {totalSeats || 0}
                </strong>
              </span>

              <span>
                Base Price:{" "}
                <strong className="text-gray-300">
                  {currency}
                  {Number(showPrice) || 0}
                </strong>
              </span>

              <span>
                Showtimes:{" "}
                <strong className="text-gray-300">
                  {Object.values(
                    dateTimeSelection
                  ).reduce(
                    (total, times) =>
                      total + times.length,
                    0
                  )}
                </strong>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 font-semibold text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-primary-dull hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? "Adding Shows..."
              : "Add Shows"}

            <PlusIcon className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default AddShows;