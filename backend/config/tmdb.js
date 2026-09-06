import axios from "axios";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

let tmdbInstance = null;

export const getTmdb = () => {
  if (tmdbInstance) return tmdbInstance;
  
  const rawKey = (process.env.TMDB_API_KEY || "").trim();

  const isV4Token = rawKey.split(".").length === 3;

  tmdbInstance = axios.create({
    baseURL: TMDB_BASE_URL,
    timeout: 30000,
    headers: isV4Token
      ? {
          Authorization: `Bearer ${rawKey}`,
          accept: "application/json",
        }
      : {
          accept: "application/json",
        },
    params: isV4Token ? {} : { api_key: rawKey },
  });

  tmdbInstance.interceptors.response.use(
    (res) => res,
    async (error) => {
      const isNetworkError = !error.response && error.code;
      const config = error.config;

      if (isNetworkError && config && !config._retried) {
        config._retried = true;

        console.warn(
          `TMDB network error (${error.code}), retrying once...`
        );

        try {
          return await tmdbInstance(config);
        } catch (retryError) {
          error = retryError;
        }
      }

      const tmdbMessage = error.response?.data?.status_message;

      console.error(
        "TMDB API error:",
        error.response?.status,
        tmdbMessage || error.message
      );

      if (tmdbMessage) {
        error.message = `TMDB: ${tmdbMessage} (status ${error.response.status})`;
      } else if (error.code) {
        error.message = `Could not reach TMDB (${error.code}). Check your internet connection or firewall/antivirus settings.`;
      }

      return Promise.reject(error);
    }
  );

  return tmdbInstance;
};