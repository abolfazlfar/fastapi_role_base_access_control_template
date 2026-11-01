import React, { useState, useEffect } from "react";
import { login, register, getMe, logout } from "./api";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    getMe().then((u) => {
      setUser(u);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      const u = await getMe();
      setUser(u);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(email, username, password);
      setMessage("Registered successfully! Please log in.");
      setMode("login");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 400, margin: "40px auto", padding: "0 20px" }}>
      <h1>Full-Stack Starter</h1>

      {user ? (
        <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: 8 }}>
          <h2>Welcome, {user.username}</h2>
          <p>Email: {user.email}</p>
          <p>Role: {user.roles_token?.join(", ") || "user"}</p>
          <button onClick={handleLogout} style={{ background: "#dc2626", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 4, cursor: "pointer" }}>
            Logout
          </button>
        </div>
      ) : (
        <>
          <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: 8, marginBottom: 16 }}>
            <h2>{mode === "login" ? "Login" : "Register"}</h2>
            <form onSubmit={mode === "login" ? handleLogin : handleRegister} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ padding: "8px", border: "1px solid #ddd", borderRadius: 4 }}
              />
              {mode === "register" && (
                <input
                  type="text"
                  placeholder="Username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ padding: "8px", border: "1px solid #ddd", borderRadius: 4 }}
                />
              )}
              <input
                type="password"
                placeholder="Password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ padding: "8px", border: "1px solid #ddd", borderRadius: 4 }}
              />
              <button type="submit" style={{ padding: "10px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
                {mode === "login" ? "Login" : "Register"}
              </button>
              {error && <p style={{ color: "#dc2626", fontSize: 14 }}>{error}</p>}
              {message && <p style={{ color: "#16a34a", fontSize: 14 }}>{message}</p>}
            </form>
            <p style={{ marginTop: 12, fontSize: 14 }}>
              {mode === "login"
                ? "Don't have an account? "
                : "Already have an account? "}
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", textDecoration: "underline" }}
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
