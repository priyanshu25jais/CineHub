import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Armchair,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
} from "lucide-react";

import Title from "../../components/admin/Title";
import { useAppContext } from "../../context/AppContext";

const SEAT_TYPES = {
  recliner: {
    label: "Recliner",
    multiplier: 3,
    description: "Premium comfort",
  },
  premium: {
    label: "Premium",
    multiplier: 2,
    description: "Premium seating",
  },
  standard: {
    label: "Standard",
    multiplier: 1.5,
    description: "Standard seating",
  },
  economy: {
    label: "Economy",
    multiplier: 1,
    description: "Regular seating",
  },
};

const createRow = (row) => ({
  row,
  seats: 9,
  type: "economy",
});

const AddTheater = () => {
  const { axios, getToken } = useAppContext();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [screens, setScreens] = useState("");
  const [facilities, setFacilities] = useState("");
  const [image, setImage] = useState("");

  const [seatLayout, setSeatLayout] = useState([
    createRow("A"),
    createRow("B"),
    createRow("C"),
    createRow("D"),
    createRow("E"),
    createRow("F"),
    createRow("G"),
    createRow("H"),
    createRow("I"),
    createRow("J"),
  ]);

  const [submitting, setSubmitting] = useState(false);

  const totalSeats = useMemo(() => {
    return seatLayout.reduce(
      (total, row) => total + Number(row.seats || 0),
      0
    );
  }, [seatLayout]);

  const updateRow = (index, field, value) => {
    setSeatLayout((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              [field]:
                field === "seats" ? Number(value) : value,
            }
          : row
      )
    );
  };

  const addRow = () => {
    if (seatLayout.length >= 26) {
      toast.error("Maximum 26 rows are allowed");
      return;
    }

    const nextRow = String.fromCharCode(
      65 + seatLayout.length
    );

    setSeatLayout((prev) => [
      ...prev,
      createRow(nextRow),
    ]);
  };

  const removeRow = (index) => {
    if (seatLayout.length <= 1) {
      toast.error("The theater must have at least one row");
      return;
    }

    setSeatLayout((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((row, i) => ({
          ...row,
          row: String.fromCharCode(65 + i),
        }))
    );
  };

  const moveRow = (index, direction) => {
    const newIndex = index + direction;

    if (
      newIndex < 0 ||
      newIndex >= seatLayout.length
    ) {
      return;
    }

    setSeatLayout((prev) => {
      const updated = [...prev];

      [updated[index], updated[newIndex]] = [
        updated[newIndex],
        updated[index],
      ];

      return updated.map((row, i) => ({
        ...row,
        row: String.fromCharCode(65 + i),
      }));
    });
  };

  const resetForm = () => {
    setName("");
    setAddress("");
    setCity("");
    setScreens("");
    setFacilities("");
    setImage("");

    setSeatLayout([
      createRow("A"),
      createRow("B"),
      createRow("C"),
      createRow("D"),
      createRow("E"),
      createRow("F"),
      createRow("G"),
      createRow("H"),
      createRow("I"),
      createRow("J"),
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !address || !city || !screens) {
      return toast.error(
        "Please fill in name, address, city and screens"
      );
    }

    if (seatLayout.length === 0) {
      return toast.error(
        "Please add at least one seat row"
      );
    }

    const invalidRow = seatLayout.find(
      (row) =>
        !row.seats ||
        row.seats < 1 ||
        row.seats > 30
    );

    if (invalidRow) {
      return toast.error(
        `Row ${invalidRow.row} must have between 1 and 30 seats`
      );
    }

    try {
      setSubmitting(true);

      const { data } = await axios.post(
        "/api/theater/add",
        {
          name,
          address,
          city,
          screens: Number(screens),

          facilities: facilities
            .split(",")
            .map((f) => f.trim())
            .filter(Boolean),

          image,

          seatLayout,
        },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );

      if (data.success) {
        toast.success(
          "Theater added successfully"
        );

        resetForm();
      } else {
        toast.error(
          data.message || "Failed to add theater"
        );
      }
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to add theater"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-10">
      <Title text1="Add" text2="Theater" />

      <form
        onSubmit={handleSubmit}
        className="mt-7 max-w-5xl"
      >
        {/* =====================================================
            BASIC INFORMATION
        ====================================================== */}

        <div className="rounded-2xl border border-white/10 bg-gray-900/50 p-6 shadow-xl backdrop-blur-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white">
              Theater Information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Add the basic details of your cinema theater.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Theater Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Theater Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="e.g. CineHub Mall"
                className="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-3 text-sm text-white outline-none transition focus:border-primary"
              />
            </div>

            {/* City */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                City
              </label>

              <input
                type="text"
                value={city}
                onChange={(e) =>
                  setCity(e.target.value)
                }
                placeholder="e.g. Ghaziabad"
                className="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-3 text-sm text-white outline-none transition focus:border-primary"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Address
              </label>

              <input
                type="text"
                value={address}
                onChange={(e) =>
                  setAddress(e.target.value)
                }
                placeholder="Street address"
                className="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-3 text-sm text-white outline-none transition focus:border-primary"
              />
            </div>

            {/* Screens */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Number of Screens
              </label>

              <input
                type="number"
                min="1"
                value={screens}
                onChange={(e) =>
                  setScreens(e.target.value)
                }
                placeholder="e.g. 6"
                className="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-3 text-sm text-white outline-none transition focus:border-primary"
              />
            </div>

            {/* Image */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Image URL{" "}
                <span className="text-gray-600">
                  (optional)
                </span>
              </label>

              <input
                type="text"
                value={image}
                onChange={(e) =>
                  setImage(e.target.value)
                }
                placeholder="https://..."
                className="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-3 text-sm text-white outline-none transition focus:border-primary"
              />
            </div>

            {/* Facilities */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Facilities{" "}
                <span className="text-gray-600">
                  (comma separated)
                </span>
              </label>

              <input
                type="text"
                value={facilities}
                onChange={(e) =>
                  setFacilities(e.target.value)
                }
                placeholder="Dolby Atmos, Parking, Recliner Seats, Food Court"
                className="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-3 text-sm text-white outline-none transition focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* =====================================================
            SEAT LAYOUT
        ====================================================== */}

        <div className="mt-7 rounded-2xl border border-white/10 bg-gray-900/50 p-6 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-white">
                Seat Layout
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Configure the seats for this theater.
              </p>
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 text-right">
              <p className="text-xs text-gray-500">
                Total Seats
              </p>

              <p className="text-xl font-bold text-primary">
                {totalSeats}
              </p>
            </div>
          </div>

          {/* Screen */}
          <div className="mx-auto mt-8 max-w-3xl">
            <div className="h-1.5 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent shadow-lg shadow-primary/20" />

            <p className="mt-2 text-center text-[10px] font-medium uppercase tracking-[0.35em] text-gray-600">
              Screen
            </p>
          </div>

          {/* Rows */}
          <div className="mt-8 space-y-3">
            {seatLayout.map((row, index) => {
              const type = SEAT_TYPES[row.type];

              return (
                <div
                  key={index}
                  className="rounded-xl border border-gray-800 bg-gray-800/30 p-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    {/* Row name */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                      {row.row}
                    </div>

                    {/* Number of seats */}
                    <div className="w-full lg:w-44">
                      <label className="mb-1.5 block text-xs text-gray-500">
                        Seats
                      </label>

                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={row.seats}
                        onChange={(e) =>
                          updateRow(
                            index,
                            "seats",
                            e.target.value
                          )
                        }
                        className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white outline-none focus:border-primary"
                      />
                    </div>

                    {/* Seat type */}
                    <div className="w-full lg:flex-1">
                      <label className="mb-1.5 block text-xs text-gray-500">
                        Seat Category
                      </label>

                      <select
                        value={row.type}
                        onChange={(e) =>
                          updateRow(
                            index,
                            "type",
                            e.target.value
                          )
                        }
                        className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white outline-none focus:border-primary"
                      >
                        {Object.entries(
                          SEAT_TYPES
                        ).map(([key, value]) => (
                          <option
                            key={key}
                            value={key}
                          >
                            {value.label} — ×
                            {value.multiplier}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Multiplier */}
                    <div className="hidden min-w-[110px] lg:block">
                      <p className="text-xs text-gray-500">
                        Price
                      </p>

                      <p className="mt-1 text-sm font-semibold text-white">
                        ×{type.multiplier}
                      </p>
                    </div>

                    {/* Move / delete */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          moveRow(index, -1)
                        }
                        disabled={index === 0}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-700 text-gray-400 transition hover:bg-gray-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                        title="Move row up"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          moveRow(index, 1)
                        }
                        disabled={
                          index ===
                          seatLayout.length - 1
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-700 text-gray-400 transition hover:bg-gray-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                        title="Move row down"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          removeRow(index)
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-900/50 text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                        title="Remove row"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Mobile price */}
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 lg:hidden">
                    <span>Price multiplier:</span>

                    <span className="font-semibold text-gray-300">
                      ×{type.multiplier}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add row */}
          <button
            type="button"
            onClick={addRow}
            className="mt-5 flex items-center gap-2 rounded-xl border border-dashed border-gray-700 px-5 py-3 text-sm font-medium text-gray-400 transition hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
          >
            <Plus className="h-4 w-4" />
            Add Row
          </button>
        </div>

        {/* =====================================================
            LIVE PREVIEW
        ====================================================== */}

        <div className="mt-7 rounded-2xl border border-white/10 bg-gray-900/50 p-6 shadow-xl backdrop-blur-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white">
              Layout Preview
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              This is how the seat arrangement will look
              to customers.
            </p>
          </div>

          <div className="overflow-x-auto pb-3">
            <div className="mx-auto min-w-[550px] max-w-4xl">
              {/* Screen */}
              <div className="mx-auto mb-8 max-w-xl">
                <div className="h-1 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent" />

                <p className="mt-2 text-center text-[10px] uppercase tracking-[0.35em] text-gray-600">
                  Screen
                </p>
              </div>

              {/* Seats */}
              <div className="flex flex-col items-center gap-3">
                {seatLayout.map((row) => {
                  const config =
                    SEAT_TYPES[row.type];

                  const seatColor =
                    row.type === "recliner"
                      ? "border-pink-500/60 bg-pink-500/10 text-pink-300"
                      : row.type === "premium"
                      ? "border-yellow-500/60 bg-yellow-500/10 text-yellow-300"
                      : row.type === "standard"
                      ? "border-blue-500/60 bg-blue-500/10 text-blue-300"
                      : "border-gray-600 bg-gray-800/50 text-gray-400";

                  return (
                    <div
                      key={row.row}
                      className="flex items-center gap-2"
                    >
                      <span className="w-6 text-center text-xs font-bold text-gray-500">
                        {row.row}
                      </span>

                      <div className="flex gap-1.5">
                        {Array.from(
                          {
                            length: row.seats,
                          },
                          (_, index) => (
                            <div
                              key={index}
                              className={`flex h-7 w-7 items-center justify-center rounded-md border text-[8px] font-semibold ${seatColor}`}
                              title={`${config.label} • Row ${row.row}`}
                            >
                              {index + 1}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-7 flex flex-wrap justify-center gap-5 border-t border-gray-800 pt-5">
            {Object.entries(SEAT_TYPES).map(
              ([key, value]) => {
                const color =
                  key === "recliner"
                    ? "border-pink-500/60 bg-pink-500/10"
                    : key === "premium"
                    ? "border-yellow-500/60 bg-yellow-500/10"
                    : key === "standard"
                    ? "border-blue-500/60 bg-blue-500/10"
                    : "border-gray-600 bg-gray-800/50";

                return (
                  <div
                    key={key}
                    className="flex items-center gap-2 text-xs text-gray-400"
                  >
                    <span
                      className={`h-4 w-4 rounded border ${color}`}
                    />

                    {value.label}

                    <span className="text-gray-600">
                      ×{value.multiplier}
                    </span>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* =====================================================
            SUBMIT
        ====================================================== */}

        <div className="mt-7 flex flex-col items-start justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/[0.04] p-6 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <Armchair className="h-5 w-5 text-primary" />

              <h3 className="font-semibold text-white">
                {totalSeats} seats configured
              </h3>
            </div>

            <p className="mt-1 text-xs text-gray-500">
              Review the layout before adding the theater.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-primary px-8 py-3 font-semibold text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-primary-dull hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {submitting
              ? "Adding Theater..."
              : "Add Theater"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTheater;