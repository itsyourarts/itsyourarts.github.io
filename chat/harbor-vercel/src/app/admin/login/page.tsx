"use client";

import { useState } from "react";
import { Alert, Mark, ThemeToggle, api } from "@/components/ui";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    const data = await api("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    setPending(false);
    if (!data.success) {
      setError(data.message || "Invalid username or password.");
      return;
    }
    window.location.assign("/admin");
  }

  return (
    <main className="auth-wrap" id="main">
      <form className="card auth-card" onSubmit={onSubmit}>
        <div className="topbar">
          <div className="brand">
            <Mark />
            <span>Harbor</span>
          </div>
          <ThemeToggle />
        </div>
        <p className="kicker" style={{ marginTop: 22 }}>Restricted</p>
        <h1 style={{ fontSize: 42, margin: "8px 0", letterSpacing: "0.04em" }}>ADMIN LOGIN</h1>
        <div style={{ display: "grid", gap: 12 }}>
          <Alert kind="error">{error}</Alert>
          <label className="field">
            <span className="label">Username</span>
            <input className="input" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required />
          </label>
          <label className="field">
            <span className="label">Password</span>
            <input className="input" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          <button className="btn btn-primary btn-block" disabled={pending} type="submit">
            {pending ? "Checking…" : "Login"}
          </button>
        </div>
      </form>
    </main>
  );
}
