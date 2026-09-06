import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Clock3,
  ChevronRight,
  ChevronLeft,
  Armchair,
  Star,
} from "lucide-react";
import Loading from "../components/Loading";
import { useAppContext } from "../context/AppContext";

const TYPE_INFO = {
  recliner: {
    label: "Recliner",
    color: "text-pink-400",
    border:
      "border-pink-500/70 text-pink-300 hover:bg-pink-500/20 hover:border-pink-400",
  },
  premium: {
    label: "Premium",
    color: "text-yellow-400",
    border:
      "border-yellow-500/70 text-yellow-300 hover:bg-yellow-500/20 hover:border-yellow-400",
  },
  standard: {
    label: "Standard",
    color: "text-blue-400",
    border:
      "border-blue-500/70 text-blue-300 hover:bg-blue-500/20 hover:border-blue-400",
  },
  economy: {
    label: "Economy",
    color: "text-gray-400",
    border:
      "border-gray-500 text-gray-300 hover:bg-gray-700/40 hover:border-gray-300",
  },
};

const getTypeInfo = (type) => {
  return TYPE_INFO[type] || TYPE_INFO.economy;
};

const SeatLayout = () => {
  const { id, date } = useParams();
  const navigate = useNavigate();

  const { axios, getToken, user, currency } = useAppContext();

  const [movie, setMovie] = useState(null);
  const [dateTime, setDateTime] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTime, setSelectedTime] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [selected, setSelected] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const basePrice = Number(selectedTime?.showPrice || 0);

  const theater = selectedTime?.theater || null;

  const seatLayout = Array.isArray(theater?.seatLayout)
    ? theater.seatLayout
    : [];

  const getSeatPrice = (seat) => {
    const row = seat.charAt(0).toUpperCase();

    const rowConfig = seatLayout.find(
      (item) => item.row.toUpperCase() === row
    );

    const multiplier = Number(rowConfig?.multiplier || 1);

    return basePrice * multiplier;
  };

  const total = selected.reduce((sum, seat) => {
    return sum + getSeatPrice(seat);
  }, 0);

  const fetchShowInfo = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(`/api/show/${id}`);

      if (data.success) {
        setMovie(data.movie);
        setDateTime(data.dateTime);
      } else {
        toast.error(data.message || "Unable to load show");
      }
    } catch (error) {
      console.error(error);
      toast.error("Unable to load show");
    } finally {
      setLoading(false);
    }
  };

  const fetchOccupiedSeats = async (showId) => {
    try {
      const { data } = await axios.get(
        `/api/booking/seats/${showId}`
      );

      if (data.success) {
        setOccupiedSeats(data.occupiedSeats || []);
      }
    } catch (error) {
      console.error(error);
      setOccupiedSeats([]);
    }
  };

  useEffect(() => {
    fetchShowInfo();
    window.scrollTo(0, 0);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (selectedTime) {
      fetchOccupiedSeats(selectedTime.showId);
      setSelected([]);
    }
  }, [selectedTime]);

  const timings = date && dateTime[date] ? dateTime[date] : [];

  const toggleSeat = (seat) => {
    if (!selectedTime) {
      return toast.error("Please select a showtime first");
    }

    if (occupiedSeats.includes(seat)) {
      return;
    }

    setSelected((prev) =>
      prev.includes(seat)
        ? prev.filter((s) => s !== seat)
        : [...prev, seat]
    );
  };

  const handleBooking = async () => {
    try {
      if (!user) {
        return toast.error("Please login to book tickets");
      }

      if (!selectedTime) {
        return toast.error("Please select a showtime");
      }

      if (selected.length === 0) {
        return toast.error("Please select at least one seat");
      }

      setSubmitting(true);

      const { data } = await axios.post(
        "/api/booking/create",
        {
          showId: selectedTime.showId,
          selectedSeats: selected,
        },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );

      if (!data.success) {
        toast.error(data.message);
        setSubmitting(false);
        return;
      }

      if (!data.paymentRequired) {
        toast.success(data.message);
        navigate("/my-bookings");
        setSubmitting(false);
        return;
      }

      if (typeof window.Razorpay === "undefined") {
        toast.error(
          "Payment gateway failed to load. Please refresh and try again."
        );
        setSubmitting(false);
        return;
      }

      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "CineHub",
        description: `${movie.title} — ${selected.join(", ")}`,
        order_id: data.order.id,

        handler: async (response) => {
          try {
            const verifyRes = await axios.post(
              "/api/booking/verify",
              {
                razorpay_order_id:
                  response.razorpay_order_id,
                razorpay_payment_id:
                  response.razorpay_payment_id,
                razorpay_signature:
                  response.razorpay_signature,
                bookingId: data.bookingId,
              },
              {
                headers: {
                  Authorization: `Bearer ${await getToken()}`,
                },
              }
            );

            if (verifyRes.data.success) {
              toast.success(
                "Payment successful! Booking confirmed."
              );

              navigate("/my-bookings");
            } else {
              toast.error(
                verifyRes.data.message ||
                  "Payment verification failed"
              );
            }
          } catch (error) {
            console.error(error);
            toast.error("Payment verification failed");
          }
        },

        modal: {
          ondismiss: () => {
            toast(
              "Payment cancelled. Your seats are held — complete payment to confirm.",
              {
                icon: "⚠️",
              }
            );
          },
        },

        prefill: {
          name: user.fullName || "",
          email:
            user.primaryEmailAddress?.emailAddress || "",
        },

        theme: {
          color: "#F84565",
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.open();
    } catch (error) {
      console.error(error);
      toast.error("Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const SeatButton = ({ seat, type }) => {
    const isOccupied = occupiedSeats.includes(seat);
    const isSelected = selected.includes(seat);

    const typeInfo = getTypeInfo(type);

    const price = getSeatPrice(seat);

    return (
      <button
        onClick={() => toggleSeat(seat)}
        disabled={isOccupied}
        title={`${typeInfo.label} • ${currency}${price}`}
        className={`h-9 w-9 rounded-lg border text-[11px] font-semibold transition-all duration-200 active:scale-90 ${
          isOccupied
            ? "cursor-not-allowed border-gray-800 bg-gray-800 text-gray-600"
            : isSelected
            ? "scale-110 border-primary bg-primary text-white shadow-lg shadow-primary/40"
            : `bg-transparent ${typeInfo.border} hover:scale-105`
        }`}
      >
        {seat}
      </button>
    );
  };

  const SeatRow = ({ row }) => {
    const rowName = String(row.row).toUpperCase();
    const seatCount = Number(row.seats || 0);

    return (
      <div className="flex items-center gap-3">
        <span className="w-5 text-right text-xs font-bold text-gray-500">
          {rowName}
        </span>

        <div className="flex gap-2">
          {Array.from({ length: seatCount }, (_, index) => {
            const seat = `${rowName}${index + 1}`;

            return (
              <SeatButton
                key={seat}
                seat={seat}
                type={row.type}
              />
            );
          })}
        </div>
      </div>
    );
  };

  const PriceCard = ({ row }) => {
    const type = row.type || "economy";
    const typeInfo = getTypeInfo(type);
    const multiplier = Number(row.multiplier || 1);
    const price = basePrice * multiplier;

    return (
      <div className="flex min-w-[150px] items-center gap-3">
        <Armchair
          className={`h-6 w-6 ${typeInfo.color}`}
        />

        <div>
          <p className="font-bold text-white">
            {currency}
            {price}
          </p>

          <p className="text-xs text-gray-300">
            {typeInfo.label}
          </p>

          <p className="text-[10px] text-gray-500">
            Row {String(row.row).toUpperCase()} • ×{multiplier}
          </p>
        </div>
      </div>
    );
  };

  if (loading) {
    return <Loading />;
  }

  if (!movie) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-20 text-gray-400">
        Show not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pb-12 pt-24 md:px-8">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-8 lg:flex-row">

        {/* LEFT PANEL */}

        <aside className="w-full flex-shrink-0 lg:w-80">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-1 text-sm text-gray-400 transition hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/80 shadow-xl">
            <div className="p-6">

              <div className="mb-2 flex items-start justify-between gap-3">
                <h2 className="font-bold text-white">
                  {movie.title}
                </h2>

                {movie.vote_average && (
                  <span className="flex items-center gap-1 text-xs text-yellow-400">
                    <Star className="h-3.5 w-3.5 fill-yellow-400" />
                    {movie.vote_average.toFixed(1)}
                  </span>
                )}
              </div>

              <p className="mb-5 text-xs text-gray-500">
                {new Date(date).toLocaleDateString(
                  "en-US",
                  {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </p>

              <h3 className="mb-3 text-sm font-semibold text-gray-300">
                Available Timings
              </h3>

              <div className="flex flex-col gap-3">
                {timings.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No showtimes for this date.
                  </p>
                )}

                {timings.map((time) => {
                  const timeString = new Date(
                    time.time
                  ).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  const isActive =
                    selectedTime?.showId === time.showId;

                  return (
                    <button
                      key={time.showId}
                      onClick={() => setSelectedTime(time)}
                      className={`rounded-xl border px-4 py-3 text-sm transition ${
                        isActive
                          ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/10"
                          : "border-gray-700 bg-gray-800/30 text-gray-400 hover:border-gray-500 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Clock3 className="h-4 w-4" />
                          {timeString}
                        </span>

                        <span className="text-xs">
                          From {currency}
                          {time.showPrice}
                        </span>
                      </div>

                      {time.theater && (
                        <div className="mt-2 text-left text-[11px] text-gray-500">
                          {time.theater.name}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedTime?.theater && (
                <div className="mt-5 rounded-xl border border-gray-800 bg-gray-800/30 p-4">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Theater
                  </p>

                  <p className="mt-1 font-semibold text-white">
                    {selectedTime.theater.name}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {selectedTime.theater.address},{" "}
                    {selectedTime.theater.city}
                  </p>

                  <p className="mt-2 text-xs text-gray-400">
                    {selectedTime.theater.totalSeats} seats
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* RIGHT SIDE */}

        <main className="flex min-w-0 flex-1 flex-col items-center">

          <h1 className="text-center text-3xl font-bold text-white">
            Select your seat
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {theater
              ? `${theater.name} • Choose your preferred seat`
              : "Choose your preferred seat"}
          </p>

          {/* SCREEN */}

          <div className="mt-8 w-full max-w-5xl">
            <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-transparent via-primary to-transparent shadow-lg shadow-primary/30" />

            <p className="mt-2 text-center text-xs uppercase tracking-[0.35em] text-gray-500">
              Screen Side
            </p>
          </div>

          {/* SEAT MAP */}

          {!selectedTime ? (
            <div className="mt-12 rounded-2xl border border-gray-800 bg-gray-900/60 px-8 py-12 text-center">
              <Armchair className="mx-auto h-10 w-10 text-gray-600" />

              <p className="mt-4 text-gray-400">
                Select a showtime to view the seat layout.
              </p>
            </div>
          ) : seatLayout.length === 0 ? (
            <div className="mt-12 rounded-2xl border border-red-900/50 bg-red-950/20 px-8 py-12 text-center">
              <p className="font-semibold text-red-400">
                Seat layout unavailable
              </p>

              <p className="mt-2 text-sm text-gray-500">
                This theater does not have a configured seat layout.
              </p>
            </div>
          ) : (
            <div className="mt-8 w-full overflow-x-auto pb-3">
              <div className="mx-auto flex min-w-max flex-col items-center gap-4">

                {seatLayout.map((row) => (
                  <SeatRow
                    key={row.row}
                    row={row}
                  />
                ))}

              </div>
            </div>
          )}

          {/* LEGEND */}

          <div className="mt-8 flex flex-wrap justify-center gap-5 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <span className="h-5 w-5 rounded-md border border-gray-500" />
              Available
            </div>

            <div className="flex items-center gap-2">
              <span className="h-5 w-5 rounded-md bg-primary" />
              Selected
            </div>

            <div className="flex items-center gap-2">
              <span className="h-5 w-5 rounded-md border border-gray-800 bg-gray-800" />
              Occupied
            </div>
          </div>

          {/* PRICE CARDS */}

          {selectedTime && seatLayout.length > 0 && (
            <div className="mt-7 flex w-full max-w-5xl flex-wrap justify-center gap-5 rounded-2xl border border-gray-800 bg-gray-900/60 p-5 backdrop-blur-sm">
              {seatLayout.map((row, index) => (
                <React.Fragment key={row.row}>
                  {index > 0 && (
                    <div className="hidden h-12 w-px bg-gray-800 md:block" />
                  )}

                  <PriceCard row={row} />
                </React.Fragment>
              ))}
            </div>
          )}

          {/* SELECTED SEATS */}

          {selected.length > 0 && (
            <div className="mt-5 w-full max-w-5xl rounded-xl border border-primary/20 bg-primary/5 px-5 py-4">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

                <div>
                  <p className="text-sm font-semibold text-white">
                    Selected Seats
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {selected.join(", ")}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-xs text-gray-500">
                    Total Amount
                  </p>

                  <p className="text-2xl font-bold text-primary">
                    {currency}
                    {total}
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* CHECKOUT */}

          <button
            onClick={handleBooking}
            disabled={
              submitting ||
              selected.length === 0 ||
              !selectedTime
            }
            className="mt-7 flex items-center gap-2 rounded-full bg-primary px-10 py-3.5 font-semibold text-white shadow-xl shadow-primary/20 transition duration-300 hover:scale-105 hover:bg-primary-dull active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            {submitting
              ? "Booking..."
              : `Proceed to Checkout${
                  selected.length > 0
                    ? ` • ${currency}${total}`
                    : ""
                }`}

            <ChevronRight className="h-4 w-4" />
          </button>

        </main>
      </div>
    </div>
  );
};

export default SeatLayout;