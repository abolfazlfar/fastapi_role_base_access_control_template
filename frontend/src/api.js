const API_BASE = "/api/v1";

export async function apiRequest(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...options.headers };
  const token = localStorage.getItem("access_token");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  return res;
}

export async function register(email, username, password) {
  const res = await apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Registration failed");
  return data;
}

export async function login(email, password) {
  const form = new FormData();
  form.append("email", email);
  form.append("password", password);
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Login failed");
  localStorage.setItem("access_token", data.access_token);
  return data;
}

export async function logout() {
  const res = await apiRequest("/auth/logout", { method: "POST" });
  localStorage.removeItem("access_token");
  return res.ok;
}

export async function getMe() {
  const res = await apiRequest("/auth/me");
  if (!res.ok) return null;
  return res.json();
}

export async function refreshToken() {
  const res = await apiRequest("/auth/refresh", { method: "POST" });
  if (!res.ok) throw new Error("Refresh failed");
  const data = await res.json();
  localStorage.setItem("access_token", data.access_token);
  return data;
}
