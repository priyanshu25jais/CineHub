import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  Moon,
  Search,
  Sun,
  X,
  TicketPlus,
  Heart,
} from "lucide-react";
import { assets } from "../assets/assets";
import { useClerk, UserButton, useUser } from "@clerk/react";
import { useAppContext } from "../context/AppContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { user } = useUser();
  const { openSignIn } = useClerk();
  const navigate = useNavigate();
  const location = useLocation();

  const { favoriteMovies, theme, toggleTheme } = useAppContext();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Movies", path: "/movies" },
    { name: "Theaters", path: "/theaters" },
    { name: "Releases", path: "/releases" },
  ];

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(path);
  };

  const closeMenu = () => {
    setIsOpen(false);
    window.scrollTo(0, 0);
  };

  return (
    <>
      <header className="site-nav fixed top-0 left-0 right-0 z-50 w-full">
        <div className="mx-auto max-w-[1600px] px-5 sm:px-8 md:px-12 lg:px-20 xl:px-28">
          <div
            className="
              mt-3 flex h-[68px] items-center justify-between
              rounded-2xl border border-white/10
              bg-black/35 px-4 sm:px-5 md:px-6
              backdrop-blur-xl
              shadow-[0_8px_35px_rgba(0,0,0,0.25)]
              transition-all duration-300
            "
          >
            {/* Logo */}
            <Link
              to="/"
              onClick={closeMenu}
              className="shrink-0 transition-transform duration-300 hover:scale-[1.03]"
            >
              <img
                src={assets.logo}
                alt="CineHub"
                className="h-9 sm:h-10 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav
              className="
                hidden md:flex items-center gap-1
                rounded-full border border-white/10
                bg-white/[0.06] p-1.5
                backdrop-blur-md
              "
            >
              {navItems.map((item) => {
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => window.scrollTo(0, 0)}
                    className={`
                      relative rounded-full px-5 lg:px-6 py-2.5
                      text-sm lg:text-[15px] font-medium
                      transition-all duration-300
                      ${
                        active
                          ? "bg-white text-black shadow-lg"
                          : "text-gray-300 hover:bg-white/10 hover:text-white"
                      }
                    `}
                  >
                    {item.name}
                  </Link>
                );
              })}

              {favoriteMovies.length > 0 && (
                <Link
                  to="/favorite"
                  onClick={() => window.scrollTo(0, 0)}
                  className={`
                    flex items-center gap-1.5 rounded-full
                    px-5 lg:px-6 py-2.5
                    text-sm lg:text-[15px] font-medium
                    transition-all duration-300
                    ${
                      isActive("/favorite")
                        ? "bg-white text-black shadow-lg"
                        : "text-gray-300 hover:bg-white/10 hover:text-white"
                    }
                  `}
                >
                  <Heart className="w-4 h-4" />
                  Favorite
                </Link>
              )}
            </nav>

            {/* Right Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search */}
              <button
                type="button"
                className="
                  hidden sm:flex items-center justify-center
                  w-10 h-10 rounded-full
                  border border-white/10
                  bg-white/[0.05]
                  text-gray-300
                  transition-all duration-300
                  hover:bg-white/10
                  hover:text-white
                  hover:scale-105
                "
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="
                  theme-toggle flex items-center justify-center
                  w-10 h-10 rounded-full
                  border border-white/10
                  bg-white/[0.05]
                  text-gray-300
                  transition-all duration-300
                  hover:bg-white/10
                  hover:text-white
                  hover:scale-105
                  active:scale-95
                "
                aria-label={`Switch to ${
                  theme === "dark" ? "light" : "dark"
                } theme`}
                title={`Switch to ${
                  theme === "dark" ? "light" : "dark"
                } theme`}
              >
                {theme === "dark" ? (
                  <Sun className="w-[18px] h-[18px]" />
                ) : (
                  <Moon className="w-[18px] h-[18px]" />
                )}
              </button>

              {/* User */}
              {!user ? (
                <button
                  onClick={() => openSignIn()}
                  className="
                    hidden sm:block
                    rounded-full
                    bg-primary
                    px-5 lg:px-7 py-2.5
                    text-sm font-semibold text-white
                    shadow-lg shadow-pink-500/20
                    transition-all duration-300
                    hover:bg-primary-dull
                    hover:shadow-pink-500/30
                    hover:-translate-y-0.5
                    active:scale-95
                  "
                >
                  Login
                </button>
              ) : (
                <div className="flex items-center justify-center">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-9 h-9 sm:w-10 sm:h-10",
                      },
                    }}
                  >
                    <UserButton.MenuItems>
                      <UserButton.Action
                        label="My Bookings"
                        labelIcon={<TicketPlus width={15} />}
                        onClick={() => navigate("/my-bookings")}
                      />
                    </UserButton.MenuItems>
                  </UserButton>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="
                  md:hidden flex items-center justify-center
                  w-10 h-10 rounded-full
                  border border-white/10
                  bg-white/[0.05]
                  text-gray-300
                  transition-all duration-300
                  hover:bg-white/10
                  hover:text-white
                  active:scale-95
                "
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div
        className={`
          fixed inset-0 z-[100] md:hidden
          transition-all duration-300
          ${
            isOpen
              ? "pointer-events-auto visible bg-black/70"
              : "pointer-events-none invisible bg-black/0"
          }
        `}
        onClick={() => setIsOpen(false)}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`
            absolute right-0 top-0
            h-full w-[82%] max-w-sm
            border-l border-white/10
            bg-[#0a0a0d]/95
            px-6 pt-7
            shadow-2xl backdrop-blur-2xl
            transition-transform duration-300
            ${
              isOpen
                ? "translate-x-0"
                : "translate-x-full"
            }
          `}
        >
          {/* Mobile Header */}
          <div className="flex items-center justify-between">
            <Link to="/" onClick={closeMenu}>
              <img
                src={assets.logo}
                alt="CineHub"
                className="h-9 w-auto"
              />
            </Link>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="
                flex h-10 w-10 items-center justify-center
                rounded-full border border-white/10
                bg-white/5 text-gray-300
                transition hover:bg-white/10 hover:text-white
              "
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile Links */}
          <nav className="mt-12 flex flex-col gap-2">
            {navItems.map((item) => {
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMenu}
                  className={`
                    rounded-xl px-5 py-4
                    text-base font-medium
                    transition-all duration-300
                    ${
                      active
                        ? "bg-primary text-white shadow-lg shadow-pink-500/20"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }
                  `}
                >
                  {item.name}
                </Link>
              );
            })}

            {favoriteMovies.length > 0 && (
              <Link
                to="/favorite"
                onClick={closeMenu}
                className={`
                  flex items-center gap-3
                  rounded-xl px-5 py-4
                  text-base font-medium
                  transition-all duration-300
                  ${
                    isActive("/favorite")
                      ? "bg-primary text-white shadow-lg shadow-pink-500/20"
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                  }
                `}
              >
                <Heart className="w-5 h-5" />
                Favorite
              </Link>
            )}
          </nav>

          {/* Mobile Account */}
          <div className="mt-8 border-t border-white/10 pt-7">
            {!user ? (
              <button
                onClick={() => {
                  setIsOpen(false);
                  openSignIn();
                }}
                className="
                  w-full rounded-xl
                  bg-primary px-5 py-3.5
                  text-sm font-semibold text-white
                  shadow-lg shadow-pink-500/20
                  transition hover:bg-primary-dull
                  active:scale-[0.98]
                "
              >
                Login
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/my-bookings");
                }}
                className="
                  flex w-full items-center gap-3
                  rounded-xl border border-white/10
                  bg-white/5 px-5 py-4
                  text-gray-200
                  transition hover:bg-white/10
                "
              >
                <TicketPlus className="w-5 h-5" />
                My Bookings
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;