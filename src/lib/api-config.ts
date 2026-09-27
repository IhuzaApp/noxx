export const API_BASE =
  import.meta.env.API_URL ||
  (typeof window !== "undefined" && window.location.port === "3000"
    ? "http://localhost:4000"
    : "");
