const rawApiUrl = process.env.EXPO_PUBLIC_API_URL;

if (!rawApiUrl) {
  throw new Error("EXPO_PUBLIC_API_URL is not defined");
}

const API_URL = rawApiUrl.replace(/\/+$/, "");

export const api = (path: string) => {
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${API_URL}/${cleanPath}`;
};
