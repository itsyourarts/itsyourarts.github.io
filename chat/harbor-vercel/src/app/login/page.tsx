"use client";

import Link from "next/link";
import { useState } from "react";
import { Alert, Mark, ThemeToggle, api } from "@/components/ui";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setPending(true);
    const data = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    });
    setPending(false);
    if (!data.success) {
      setError(data.message || "Could not log in.");
      return;
    }
    window.location.assign("/app");
  }

  return (
    <main className="auth-wrap" id="main">
      <form className="card auth-card" onSubmit={onSubmit}>
        <div className="topbar">
          <Link className="brand" href="/">
            <Mark />
            <span>Harbor</span>
          </Link>
          <ThemeToggle />
        </div>
        <h1 style={{ fontSize: 42, margin: "18px 0 6px" }}>Welcome back.</h1>
        <p className="hint">Use the username or phone number on your account.</p>
        <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
          <Alert kind="error">{error}</Alert>
          <label className="field">
            <span className="label">Username / Phone</span>
            <input className="input" autoComplete="username" value={identifier} onChange={(event) => setIdentifier(event.target.value)} required />
          </label>
          <label className="field">
            <span className="label">Password</span>
            <input className="input" type={show ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          <button className="btn btn-ghost btn-small" type="button" onClick={() => setShow((value) => !value)}>
            {show ? "Hide password" : "Show password"}
          </button>
          <button className="btn btn-primary btn-block" disabled={pending} type="submit">
            {pending ? "Checking…" : "Login"}
          </button>
          <p className="hint">
            New here? <Link href="/signup">Create an account</Link>
          </p>
        </div>
      </form>
    </main>
  );
}
