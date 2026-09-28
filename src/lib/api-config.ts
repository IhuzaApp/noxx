const envApiUrl = import.meta.env.VITE_API_URL || import.meta.env.API_URL;

export const API_BASE =
  typeof window !== "undefined" && window.location.port === "3000"
    ? "http://localhost:4000"
    : envApiUrl && envApiUrl !== "https://noxxdesk.com"
      ? envApiUrl
      : "";

export async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit,
): Promise<{ ok: boolean; data?: T; status: number }> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) return { ok: false, status: res.status };
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return { ok: false, status: res.status };
    }
    const data = await res.json();
    return { ok: true, data, status: res.status };
  } catch (err) {
    console.error(`[API] Fetch error for ${url}:`, err);
    return { ok: false, status: 0 };
  }
}

