"use client";

import { useEffect, useState } from "react";
import { Alert, Mark, Modal, ThemeToggle, api, formatParts } from "@/components/ui";

type Connection = {
  exists: boolean;
  provider: string;
  providerLabel: string;
  supportsQrAuth: boolean;
  status: string;
  displayName: string | null;
  phoneNumber: string | null;
  providerConnectionId: string | null;
  businessAccountId: string | null;
  lastConnectedAt: string | null;
  lastCheckedAt: string | null;
  lastError: string | null;
  configured: boolean;
  webhookConfigured: boolean;
  officialAuth: { method: string; instructions: string };
  metadata?: Record<string, string | number | boolean | null>;
};

type AdminUser = {
  id: string;
  name: string | null;
  username: string | null;
  phone: string | null;
  bio: string | null;
  verification: string;
  status: string;
  accountStatus: string;
  presence: string;
  createdAt: string;
  lastLoginAt: string | null;
  lastSeenAt: string | null;
};

type Stats = { totalUsers: number; verifiedUsers: number; activeUsers: number };
type Audit = { id: string; action: string; target: string | null; admin: string | null; createdAt: string; ip: string | null };

const statusCopy: Record<string, { label: string; kind: "ok" | "off" | "warn" | "muted" }> = {
  CONNECTED: { label: "Connected", kind: "ok" },
  DISCONNECTED: { label: "Disconnected", kind: "off" },
  CONNECTING: { label: "Connecting", kind: "warn" },
  EXPIRED: { label: "Session Expired", kind: "warn" },
  ERROR: { label: "Session Expired", kind: "warn" },
};

export function AdminDashboard() {
  const [admin, setAdmin] = useState("");
  const [connection, setConnection] = useState<Connection | null>(null);
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, verifiedUsers: 0, activeUsers: 0 });
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [logs, setLogs] = useState<Audit[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [verification, setVerification] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");
  const [connectOpen, setConnectOpen] = useState(false);
  const [viewUser, setViewUser] = useState<AdminUser | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null);
  const [typed, setTyped] = useState("");
  const [confirmDisable, setConfirmDisable] = useState<AdminUser | null>(null);

  async function loadMe() {
    const data = await api<{ admin: { username: string } }>("/api/admin/me");
    if (!data.success) {
      window.location.assign("/admin/login");
      return;
    }
    setAdmin(data.admin.username);
  }

  async function loadConnection() {
    const data = await api<{ connection: Connection }>("/api/admin/whatsapp/status");
    if (data.success) setConnection(data.connection);
  }

  async function loadUsers(nextPage = page) {
    const params = new URLSearchParams({
      q,
      page: String(nextPage),
      pageSize: "12",
      sort,
      order,
      status,
      verification,
    });
    const data = await api<{ users: AdminUser[]; stats: Stats; pageCount: number }>(`/api/admin/users?${params.toString()}`);
    if (!data.success) {
      setError(data.message || "Could not load users.");
      return;
    }
    setUsers(data.users ?? []);
    setStats(data.stats);
    setPageCount(data.pageCount || 1);
  }

  async function loadAudit() {
    const data = await api<{ logs: Audit[] }>("/api/admin/audit");
    if (data.success) setLogs(data.logs ?? []);
  }

  useEffect(() => {
    loadMe();
    loadConnection();
    loadAudit();
    const timer = window.setInterval(loadConnection, 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { loadUsers(page); }, 200);
    return () => window.clearTimeout(timer);
  }, [q, status, verification, sort, order, page]);

  async function run(action: string, path: string, method: string) {
    setBusy(action);
    setError("");
    const data = await api<{ connection?: Connection }>(path, { method });
    setBusy("");
    if (!data.success) {
      setError(data.message || "Request failed.");
      return;
    }
    setNotice(data.message || "Updated.");
    if (data.connection) setConnection(data.connection);
    else await loadConnection();
    await loadAudit();
    setConnectOpen(false);
  }

  async function setAccount(user: AdminUser, accountStatus: "ACTIVE" | "DISABLED") {
    setBusy(user.id);
    const data = await api(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      body: JSON.stringify({ accountStatus }),
    });
    setBusy("");
    setConfirmDisable(null);
    if (!data.success) {
      setError(data.message || "Could not update the user.");
      return;
    }
    setNotice(data.message || "Updated.");
    setViewUser(null);
    await loadUsers();
    await loadAudit();
  }

  async function removeUser() {
    if (!confirmDelete) return;
    setBusy(confirmDelete.id);
    const data = await api(`/api/admin/users/${confirmDelete.id}`, { method: "DELETE" });
    setBusy("");
    if (!data.success) {
      setError(data.message || "Could not delete the user.");
      return;
    }
    setNotice("User deleted.");
    setConfirmDelete(null);
    setTyped("");
    setViewUser(null);
    await loadUsers();
    await loadAudit();
  }

  async function logout() {
    await api("/api/admin/logout", { method: "POST" });
    window.location.assign("/admin/login");
  }

  function toggleSort(next: string) {
    if (sort === next) setOrder(order === "asc" ? "desc" : "asc");
    else {
      setSort(next);
      setOrder("asc");
    }
    setPage(1);
  }

  const wa = connection;
  const pill = statusCopy[wa?.status || "DISCONNECTED"] ?? statusCopy.DISCONNECTED;
  const checked = formatParts(wa?.lastCheckedAt);
  const connectedAt = formatParts(wa?.lastConnectedAt);

  return (
    <div className="admin-shell">
      <aside className="side">
        <div className="brand" style={{ marginBottom: 12 }}>
          <Mark />
          <span>Harbor</span>
        </div>
        <a href="#whatsapp">WhatsApp</a>
        <a href="#users">User database</a>
        <a href="#audit">Audit log</a>
        <div style={{ marginTop: "auto", display: "grid", gap: 8 }}>
          <ThemeToggle />
          <button className="linkish" type="button" onClick={logout}>Sign out {admin ? `(${admin})` : ""}</button>
        </div>
      </aside>
      <main className="admin-main" id="main">
        <div className="admin-top">
          <div>
            <p className="kicker">Restricted</p>
            <h1 style={{ margin: "4px 0 0", fontSize: 48 }}>Admin dashboard</h1>
          </div>
        </div>
        <Alert kind="error">{error}</Alert>
        <Alert kind="ok">{notice}</Alert>

        <section className="card" id="whatsapp" style={{ padding: 18 }}>
          <div className="topbar">
            <div>
              <p className="kicker">Top section</p>
              <h2 style={{ margin: "4px 0" }}>WhatsApp connection</h2>
            </div>
            <span className={`badge badge-${pill.kind}`}><span className="dot" /> {pill.label}</span>
          </div>
          <p className="hint" style={{ maxWidth: 760 }}>
            This connection is global. It is not attached to individual users, and it is not a WhatsApp Web session.
            {wa?.supportsQrAuth
              ? " This provider reports QR authentication."
              : " The configured provider does not support QR login, so Harbor uses its official token check instead of a fake QR."}
          </p>
          <div className="stats" style={{ marginTop: 14 }}>
            <div className="stat card">
              <span className="hint">Provider</span>
              <b style={{ fontSize: 22 }}>{wa?.providerLabel || "—"}</b>
            </div>
            <div className="stat card">
              <span className="hint">Account</span>
              <b style={{ fontSize: 22 }}>{wa?.displayName || "Not connected"}</b>
              <span className="hint">{wa?.phoneNumber || "No number yet"}</span>
            </div>
            <div className="stat card">
              <span className="hint">Times</span>
              <strong>Connected {connectedAt.date} {wa?.lastConnectedAt ? connectedAt.time : ""}</strong>
              <span className="hint">Last checked {checked.date} {wa?.lastCheckedAt ? checked.time : ""}</span>
            </div>
          </div>
          {wa?.lastError && <div style={{ marginTop: 12 }}><Alert kind="warn">{wa.lastError}</Alert></div>}
          <div className="hint" style={{ marginTop: 8 }}>
            Phone number ID: {wa?.providerConnectionId || "—"} · WABA: {wa?.businessAccountId || "—"} · Credentials on server: {wa?.configured ? "yes" : "no"} · Webhook: {wa?.webhookConfigured ? "configured" : "not set"}
          </div>
          <div className="actions">
            {(!wa?.exists || wa.status === "DISCONNECTED") && (
              <button className="btn btn-primary" type="button" onClick={() => setConnectOpen(true)}>+ Add session</button>
            )}
            {wa?.exists && wa.status !== "DISCONNECTED" && (
              <button className="btn btn-ghost" type="button" disabled={busy === "reconnect"} onClick={() => run("reconnect", "/api/admin/whatsapp/reconnect", "POST")}>Reconnect</button>
            )}
            {wa?.exists && wa.status === "CONNECTED" && (
              <button className="btn btn-ghost" type="button" disabled={busy === "disconnect"} onClick={() => run("disconnect", "/api/admin/whatsapp/disconnect", "POST")}>Disconnect</button>
            )}
            {wa?.exists && (
              <button
                className="btn btn-danger"
                type="button"
                disabled={busy === "delete"}
                onClick={() => {
                  if (window.confirm("Delete this WhatsApp connection record? The number stays in Meta. Rotate the token there if it may have been exposed.")) {
                    run("delete", "/api/admin/whatsapp", "DELETE");
                  }
                }}
              >
                Delete
              </button>
            )}
          </div>
        </section>

        <section id="users">
          <div className="topbar">
            <div>
              <p className="kicker">Below the WhatsApp section</p>
              <h2 style={{ margin: "4px 0" }}>User database</h2>
            </div>
          </div>
          <div className="stats">
            <div className="stat card"><span className="hint">Total users</span><b>{stats.totalUsers}</b></div>
            <div className="stat card"><span className="hint">Verified users</span><b>{stats.verifiedUsers}</b></div>
            <div className="stat card"><span className="hint">Active users</span><b>{stats.activeUsers}</b></div>
          </div>
          <div className="filters" style={{ margin: "12px 0" }}>
            <input className="input" style={{ maxWidth: 280 }} placeholder="Search name, username, phone" value={q} onChange={(event) => { setPage(1); setQ(event.target.value); }} />
            <select className="select" style={{ maxWidth: 180 }} value={status} onChange={(event) => { setPage(1); setStatus(event.target.value); }}>
              <option value="">All statuses</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="disabled">Disabled</option>
            </select>
            <select className="select" style={{ maxWidth: 180 }} value={verification} onChange={(event) => { setPage(1); setVerification(event.target.value); }}>
              <option value="">All verification</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th><button type="button" onClick={() => toggleSort("name")}>Name</button></th>
                  <th><button type="button" onClick={() => toggleSort("username")}>Username</button></th>
                  <th><button type="button" onClick={() => toggleSort("phone")}>Phone</button></th>
                  <th><button type="button" onClick={() => toggleSort("verification")}>Verification</button></th>
                  <th><button type="button" onClick={() => toggleSort("status")}>Status</button></th>
                  <th><button type="button" onClick={() => toggleSort("createdAt")}>Created</button></th>
                  <th><button type="button" onClick={() => toggleSort("lastLoginAt")}>Last login</button></th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr><td colSpan={8}>No users match these filters.</td></tr>
                )}
                {users.map((user) => {
                  const created = formatParts(user.createdAt);
                  const login = formatParts(user.lastLoginAt);
                  return (
                    <tr key={user.id}>
                      <td>{user.name || "—"}</td>
                      <td>{user.username || "—"}</td>
                      <td>{user.phone || "—"}</td>
                      <td>{user.verification}</td>
                      <td>{user.status}</td>
                      <td>{created.date}<div className="hint">{created.time}</div></td>
                      <td>{login.date}<div className="hint">{user.lastLoginAt ? login.time : ""}</div></td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-ghost btn-small" type="button" onClick={() => setViewUser(user)}>View</button>
                          <button className="btn btn-ghost btn-small" type="button" onClick={() => setConfirmDisable(user)}>
                            {user.accountStatus === "DISABLED" ? "Enable" : "Disable"}
                          </button>
                          <button className="btn btn-danger btn-small" type="button" onClick={() => { setConfirmDelete(user); setTyped(""); }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="topbar" style={{ marginTop: 10 }}>
            <span className="hint">Page {page} of {pageCount}</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-ghost btn-small" type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button>
              <button className="btn btn-ghost btn-small" type="button" disabled={page >= pageCount} onClick={() => setPage((value) => value + 1)}>Next</button>
            </div>
          </div>
        </section>

        <section className="card" id="audit" style={{ padding: 18 }}>
          <h2 style={{ marginTop: 0 }}>Recent admin actions</h2>
          {logs.length === 0 && <p className="hint">No audit events yet.</p>}
          {logs.map((log) => (
            <div key={log.id} className="topbar" style={{ borderTop: "1px solid var(--line)", padding: "8px 0" }}>
              <div>
                <strong>{log.action}</strong>
                <div className="hint">{log.admin || "system"} · {log.target || "—"} · {log.ip || ""}</div>
              </div>
              <span className="hint">{formatParts(log.createdAt).date} {formatParts(log.createdAt).time}</span>
            </div>
          ))}
        </section>
      </main>

      {connectOpen && (
        <Modal title="WhatsApp login" wide onClose={() => setConnectOpen(false)}>
          <div className="qr-slot">
            {wa?.supportsQrAuth ? (
              <p>Waiting for the provider’s official QR. Harbor only displays a QR returned by an authorized provider.</p>
            ) : (
              <div>
                <p className="kicker">Official flow</p>
                <h3 style={{ fontSize: 32, margin: "8px 0" }}>No QR for this provider</h3>
                <p>{wa?.officialAuth.instructions}</p>
                <p className="hint">Status: {busy === "connect" ? "Waiting for authentication..." : "Ready to verify the server credentials."}</p>
              </div>
            )}
          </div>
          <div className="actions">
            <button className="btn btn-primary" type="button" disabled={busy === "connect"} onClick={() => run("connect", "/api/admin/whatsapp/connect", "POST")}>
              {busy === "connect" ? "Waiting for authentication..." : "Verify connection"}
            </button>
            <button className="btn btn-ghost" type="button" onClick={() => setConnectOpen(false)}>Close</button>
          </div>
        </Modal>
      )}

      {viewUser && (
        <Modal title="User details" onClose={() => setViewUser(null)}>
          <dl style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 8 }}>
            <dt>Name</dt><dd>{viewUser.name || "—"}</dd>
            <dt>Username</dt><dd>{viewUser.username || "—"}</dd>
            <dt>Phone</dt><dd>{viewUser.phone || "—"}</dd>
            <dt>Verification</dt><dd>{viewUser.verification}</dd>
            <dt>Account status</dt><dd>{viewUser.accountStatus}</dd>
            <dt>Presence</dt><dd>{viewUser.presence}</dd>
            <dt>Created</dt><dd>{formatParts(viewUser.createdAt).date} {formatParts(viewUser.createdAt).time}</dd>
            <dt>Last login</dt><dd>{viewUser.lastLoginAt ? `${formatParts(viewUser.lastLoginAt).date} ${formatParts(viewUser.lastLoginAt).time}` : "—"}</dd>
            <dt>Bio</dt><dd>{viewUser.bio || "—"}</dd>
          </dl>
          <p className="hint">Password hashes and provider secrets are not shown.</p>
        </Modal>
      )}

      {confirmDisable && (
        <Modal title={confirmDisable.accountStatus === "DISABLED" ? "Enable user" : "Disable user"} onClose={() => setConfirmDisable(null)}>
          <p>
            {confirmDisable.accountStatus === "DISABLED"
              ? `Allow ${confirmDisable.username} to log in again?`
              : `Disable ${confirmDisable.username}? They will be signed out and unable to log in.`}
          </p>
          <div className="actions">
            <button className="btn btn-ghost" type="button" onClick={() => setConfirmDisable(null)}>Cancel</button>
            <button className="btn btn-primary" type="button" onClick={() => setAccount(confirmDisable, confirmDisable.accountStatus === "DISABLED" ? "ACTIVE" : "DISABLED")}>
              Confirm
            </button>
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Delete user" onClose={() => setConfirmDelete(null)}>
          <p>This removes {confirmDelete.name || confirmDelete.username} and their messages. Type the username to confirm.</p>
          <input className="input" value={typed} onChange={(event) => setTyped(event.target.value)} placeholder={confirmDelete.username || ""} />
          <div className="actions">
            <button className="btn btn-ghost" type="button" onClick={() => setConfirmDelete(null)}>Cancel</button>
            <button className="btn btn-danger" type="button" disabled={typed !== (confirmDelete.username || "")} onClick={removeUser}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
