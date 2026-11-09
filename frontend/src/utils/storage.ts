export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://learning-english-app-lqg7.onrender.com");

export const getUserKey = (key: string): string => {
  if (typeof window === 'undefined') return key;
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user && user.id) {
        return `${key}_${user.id}`;
      }
    }
  } catch (e) {
    console.error("Error parsing user from localStorage", e);
  }
  return key;
};
