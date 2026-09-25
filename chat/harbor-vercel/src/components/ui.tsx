"use client";

import { useEffect, useState } from "react";

export function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#14332e" />
      <path d="M7.5 23V9h3.1v5.4h5.8V9h3.1v14h-3.1v-5.7h-5.8V23H7.5z" fill="#f4efe6" />
      <path d="M21.6 23V9H25v14h-3.4z" fill="#e0a27a" />
    </svg>
  );
}

export function ThemeToggle() {
  const [theme, setTheme] = useState("dark");
  useEffect(() => {
    setTheme(document.documentElement.dataset.theme || "dark");
  }, []);
  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("harbor-theme", next);
    setTheme(next);
  }
  return (
    <button className="btn btn-ghost btn-small" type="button" onClick={toggle}>
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}

export function Alert({ kind, children }: { kind: "error" | "ok" | "warn"; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className={`alert alert-${kind}`} role={kind === "error" ? "alert" : "status"}>
      {children}
    </div>
  );
}

export function Modal({
  title,
  children,
  onClose,
  wide,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className={`modal card ${wide ? "" : "drawer"}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="topbar" style={{ marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 32 }}>{title}</h2>
          <button className="btn btn-ghost btn-small" type="button" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export async function api<T extends object>(path: string, init?: RequestInit): Promise<T & { success: boolean; message?: string }> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const run = () => fetch(path, { ...init, headers, credentials: "include" });
  let response = await run();
  if (response.status === 401 && !path.startsWith("/api/auth/") && !path.startsWith("/api/admin/login")) {
    const refreshPath = path.startsWith("/api/admin") ? null : "/api/auth/refresh";
    if (refreshPath) {
      const refreshed = await fetch(refreshPath, { method: "POST", credentials: "include" });
      if (refreshed.ok) response = await run();
    }
  }
  const data = (await response.json().catch(() => ({ success: false, message: "Unexpected server response." }))) as T & {
    success: boolean;
    message?: string;
  };
  return data;
}

export function formatParts(iso?: string | null) {
  if (!iso) return { date: "—", time: "—" };
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return {
    date: `${get("day")} ${get("month")} ${get("year")}`,
    time: `${get("hour")}:${get("minute")} ${get("dayPeriod").toUpperCase()}`,
  };
}

export function initials(name?: string | null, username?: string | null) {
  const source = (name || username || "?").trim();
  const bits = source.split(/\s+/).filter(Boolean);
  if (bits.length >= 2) return `${bits[0]![0] ?? ""}${bits[1]![0] ?? ""}`.toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export function presenceLabel(status?: string | null) {
  if (status === "ONLINE") return "Online";
  if (status === "DISABLED") return "Disabled";
  return "Offline";
}
