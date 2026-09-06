import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth, useUser } from "@clerk/react";
import { useLocation, useNavigate } from "react-router-dom";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [shows, setShows] = useState([]);
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const [loadingShows, setLoadingShows] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem("cinehub-theme") || "dark");

  const currency = import.meta.env.VITE_CURRENCY || "$";
  const image_base_url = import.meta.env.VITE_TMDB_IMAGE_BASE_URL || "";

  const { user } = useUser();
  const { getToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("cinehub-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => currentTheme === "dark" ? "light" : "dark");
  };

  const fetchIsAdmin = async () => {
    try {
      const { data } = await axios.get("/api/admin/is-admin", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      setIsAdmin(data.isAdmin);

      if (!data.isAdmin && location.pathname.startsWith("/admin")) {
        navigate("/");
        toast.error("You are not authorized to access this page");
      }
    } catch (error) {
      setIsAdmin(false);
      console.error("Error fetching admin status:", error);
    }
  };

  const fetchShows = async () => {
    try {
      setLoadingShows(true);
      const { data } = await axios.get("/api/show/all");
      if (data.success) {
        setShows(data.shows);
      } else {
        toast.error(data.message || "Failed to fetch shows");
      }
    } catch (error) {
      console.error("Error fetching shows:", error);
    } finally {
      setLoadingShows(false);
    }
  };

  const fetchFavoriteMovies = async () => {
    try {
      const { data } = await axios.get("/api/user/favorites", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        setFavoriteMovies(data.movies);
      } else {
        toast.error(data.message || "Failed to fetch favorite movies");
      }
    } catch (error) {
      console.error("Error fetching favorite movies:", error);
    }
  };

  useEffect(() => {
    fetchShows();
  }, []);

  useEffect(() => {
    if (user) {
      fetchIsAdmin();
      fetchFavoriteMovies();
    } else {
      setIsAdmin(false);
      setFavoriteMovies([]);
    }
  }, [user]);

  const value = {
    axios,
    currency,
    fetchIsAdmin,
    fetchAdmin: fetchIsAdmin,
    user,
    getToken,
    navigate,
    isAdmin,
    shows,
    loadingShows,
    fetchShows,
    favoriteMovies,
    fetchFavoriteMovies,
    image_base_url,
    theme,
    toggleTheme,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
