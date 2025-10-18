// src/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const loginUser = async (email, password) => {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
};

export const googleLogin = async (user) => {
  const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      full_name: user.name,
      email: user.email,
      profile: user.picture,
      method: "google",
      agreed_to_terms: true,
    }),
  });
  return res.json();
};
