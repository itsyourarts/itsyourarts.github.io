"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Alert, Mark, ThemeToggle, api } from "@/components/ui";

const emptyOtp = ["", "", "", "", "", ""];

export default function SignupPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [phone, setPhone] = useState("+91 ");
  const [otp, setOtp] = useState(emptyOtp);
  const [devOtp, setDevOtp] = useState("");
  const [ticket, setTicket] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    return score;
  }, [password]);

  async function sendOtp(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setPending(true);
    const data = await api<{ devOtp?: string }>("/api/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ phone, purpose: "signup" }),
    });
    setPending(false);
    if (!data.success) {
      setError(data.message || "Could not send the code.");
      return;
    }
    if (data.devOtp) {
      setDevOtp(data.devOtp);
      setOtp(data.devOtp.split(""));
    }
    setStep(2);
  }

  function setDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && inputs.current[index + 1]) inputs.current[index + 1]?.focus();
  }

  function onPaste(event: React.ClipboardEvent) {
    const text = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    event.preventDefault();
    const next = text.split("");
    while (next.length < 6) next.push("");
    setOtp(next);
  }

  async function verifyOtp(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setPending(true);
    const data = await api<{ signupTicket?: string }>("/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ phone, otp: otp.join(""), purpose: "signup" }),
    });
    setPending(false);
    if (!data.success || !data.signupTicket) {
      setError(data.message || "Invalid OTP");
      return;
    }
    setTicket(data.signupTicket);
    setStep(3);
  }

  async function createAccount(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setPending(true);
    const data = await api("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ signupTicket: ticket, name, username, password, confirmPassword }),
    });
    setPending(false);
    if (!data.success) {
      setError(data.message || "Could not create the account.");
      return;
    }
    window.location.assign("/app");
  }

  return (
    <main className="auth-wrap" id="main">
      <div className="card auth-card">
        <div className="topbar">
          <Link className="brand" href="/">
            <Mark />
            <span>Harbor</span>
          </Link>
          <ThemeToggle />
        </div>
        <p className="kicker" style={{ marginTop: 18 }}>Step {step} of 3</p>
        <h1 style={{ fontSize: 40, margin: "6px 0 8px" }}>
          {step === 1 ? "Start with your number." : step === 2 ? "Enter the code." : "Make the account."}
        </h1>
        <Alert kind="error">{error}</Alert>
        {step === 1 && (
          <form onSubmit={sendOtp} style={{ display: "grid", gap: 12, marginTop: 14 }}>
            <label className="field">
              <span className="label">Phone number</span>
              <input className="input" inputMode="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+91 98765 43210" required />
            </label>
            <p className="hint">Include the country code. India is assumed if you omit the plus sign.</p>
            <button className="btn btn-primary btn-block" disabled={pending} type="submit">
              {pending ? "Sending…" : "Send OTP"}
            </button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={verifyOtp} style={{ display: "grid", gap: 12, marginTop: 14 }}>
            {devOtp && <Alert kind="warn">Development provider returned {devOtp}. Production never includes the code in the response.</Alert>}
            <div className="otp-row" onPaste={onPaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(node) => { inputs.current[index] = node; }}
                  className="input otp-box"
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  value={digit}
                  aria-label={`Digit ${index + 1}`}
                  onChange={(event) => setDigit(index, event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Backspace" && !otp[index] && inputs.current[index - 1]) inputs.current[index - 1]?.focus();
                  }}
                />
              ))}
            </div>
            <button className="btn btn-primary btn-block" disabled={pending || otp.join("").length !== 6} type="submit">
              {pending ? "Verifying…" : "Verify OTP"}
            </button>
            <button className="btn btn-ghost btn-block" type="button" onClick={() => setStep(1)}>Use a different number</button>
          </form>
        )}
        {step === 3 && (
          <form onSubmit={createAccount} style={{ display: "grid", gap: 12, marginTop: 14 }}>
            <label className="field">
              <span className="label">Name</span>
              <input className="input" value={name} onChange={(event) => setName(event.target.value)} required />
            </label>
            <label className="field">
              <span className="label">Username</span>
              <input className="input" value={username} onChange={(event) => setUsername(event.target.value.toLowerCase())} required />
            </label>
            <label className="field">
              <span className="label">Password</span>
              <input className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
              <span className="hint">{strength < 3 ? "Use 10+ characters with upper, lower, and a number." : "Strong enough."}</span>
            </label>
            <label className="field">
              <span className="label">Confirm password</span>
              <input className="input" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
            </label>
            <button className="btn btn-primary btn-block" disabled={pending} type="submit">
              {pending ? "Creating…" : "Create account"}
            </button>
          </form>
        )}
        <p className="hint" style={{ marginTop: 16 }}>
          Already registered? <Link href="/login">Log in</Link>
        </p>
      </div>
    </main>
  );
}
