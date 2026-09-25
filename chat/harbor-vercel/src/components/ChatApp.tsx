"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Alert, Mark, ThemeToggle, api, formatParts, initials, presenceLabel } from "@/components/ui";

type Me = {
  id: string;
  name: string | null;
  username: string | null;
  phone: string | null;
  bio: string | null;
  status: string;
  createdAt: string;
  lastLoginAt: string | null;
};

type PublicUser = {
  id: string;
  name: string | null;
  username: string | null;
  status: string;
  lastSeenAt: string | null;
};

type Conversation = {
  user: PublicUser;
  lastMessage: { id: string; senderId: string; message: string; createdAt: string; readAt: string | null };
  unreadCount: number;
};

type Item = {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  createdAt: string;
  readAt: string | null;
};

type View = "chats" | "search" | "profile" | "settings";

export function ChatApp() {
  const [me, setMe] = useState<Me | null>(null);
  const [view, setView] = useState<View>("chats");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [peer, setPeer] = useState<PublicUser | null>(null);
  const [messages, setMessages] = useState<Item[]>([]);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PublicUser[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [sending, setSending] = useState(false);
  const [profile, setProfile] = useState({ name: "", username: "", bio: "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [deletePassword, setDeletePassword] = useState("");
  const stream = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    api<{ user: Me }>("/api/auth/me").then((data) => {
      if (!data.success || !data.user) {
        window.location.assign("/login");
        return;
      }
      setMe(data.user);
      setProfile({ name: data.user.name ?? "", username: data.user.username ?? "", bio: data.user.bio ?? "" });
    });
  }, []);

  useEffect(() => {
    if (!me) return;
    let stop = false;
    async function ping() {
      await api("/api/presence", { method: "POST" });
    }
    ping();
    const timer = window.setInterval(() => { if (!stop) ping(); }, 20000);
    return () => { stop = true; window.clearInterval(timer); };
  }, [me]);

  useEffect(() => {
    if (!me) return;
    let stop = false;
    async function load() {
      const data = await api<{ conversations: Conversation[] }>("/api/conversations");
      if (!stop && data.success) setConversations(data.conversations ?? []);
    }
    load();
    const timer = window.setInterval(load, 4000);
    return () => { stop = true; window.clearInterval(timer); };
  }, [me]);

  useEffect(() => {
    if (!selectedId) return;
    let stop = false;
    async function load() {
      const data = await api<{ user: PublicUser; messages: Item[] }>(`/api/messages/${selectedId}`);
      if (stop) return;
      if (!data.success) {
        setError(data.message || "Could not load messages.");
        return;
      }
      setPeer(data.user);
      setMessages(data.messages ?? []);
    }
    load();
    const timer = window.setInterval(load, 2500);
    return () => { stop = true; window.clearInterval(timer); };
  }, [selectedId]);

  useEffect(() => {
    stream.current?.scrollTo({ top: stream.current.scrollHeight });
  }, [messages.length, selectedId]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timer = window.setTimeout(async () => {
      const data = await api<{ users: PublicUser[] }>(`/api/users?q=${encodeURIComponent(query.trim())}`);
      if (data.success) setResults(data.users ?? []);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  const shellClass = selectedId && view === "chats" ? "app-shell show-chat" : "app-shell";

  async function send(event: FormEvent) {
    event.preventDefault();
    if (!selectedId || !draft.trim()) return;
    setSending(true);
    setError("");
    const data = await api<{ item: Item }>("/api/messages", {
      method: "POST",
      body: JSON.stringify({ receiverId: selectedId, message: draft }),
    });
    setSending(false);
    if (!data.success || !data.item) {
      setError(data.message || "Message was not sent.");
      return;
    }
    setDraft("");
    setMessages((current) => current.some((item) => item.id === data.item.id) ? current : [...current, data.item]);
  }

  function openUser(user: PublicUser) {
    setSelectedId(user.id);
    setPeer(user);
    setView("chats");
    setError("");
  }

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    if (!me) return;
    setError("");
    const data = await api<{ user: Me }>(`/api/users/${me.id}`, {
      method: "PATCH",
      body: JSON.stringify(profile),
    });
    if (!data.success) {
      setError(data.message || "Could not update profile.");
      return;
    }
    setMe(data.user);
    setNotice("Profile saved.");
  }

  async function changePassword(event: FormEvent) {
    event.preventDefault();
    setError("");
    const data = await api("/api/auth/change-password", { method: "POST", body: JSON.stringify(passwords) });
    if (!data.success) {
      setError(data.message || "Could not change password.");
      return;
    }
    setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setNotice("Password updated. Other sessions were signed out.");
  }

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    window.location.assign("/login");
  }

  async function deleteAccount(event: FormEvent) {
    event.preventDefault();
    if (!me) return;
    if (!window.confirm("Delete your Harbor account and messages? This cannot be undone.")) return;
    const data = await api(`/api/users/${me.id}`, { method: "DELETE", body: JSON.stringify({ password: deletePassword }) });
    if (!data.success) {
      setError(data.message || "Could not delete the account.");
      return;
    }
    window.location.assign("/");
  }

  return (
    <div className={shellClass}>
      <section className="list-pane">
        <div className="pane-head">
          <Mark size={32} />
          <div style={{ flex: 1 }}>
            <strong>{me?.name || "Harbor"}</strong>
            <div className="hint">@{me?.username}</div>
          </div>
          <ThemeToggle />
        </div>
        {view === "chats" && (
          <div className="scroll">
            {conversations.length === 0 && <p className="hint" style={{ padding: 16 }}>No conversations yet. Search for a username to start one.</p>}
            {conversations.map((conversation) => (
              <button key={conversation.user.id} className={`person ${selectedId === conversation.user.id ? "active" : ""}`} type="button" onClick={() => openUser(conversation.user)}>
                <span className="avatar">
                  {initials(conversation.user.name, conversation.user.username)}
                  <i className={`presence ${conversation.user.status === "ONLINE" ? "on" : ""}`} />
                </span>
                <span>
                  <strong>{conversation.user.name || conversation.user.username}</strong>
                  <div className="hint">{conversation.lastMessage.message.replace(/\s+/g, " ").slice(0, 72)}</div>
                </span>
                <span style={{ textAlign: "right" }}>
                  <div className="hint">{formatParts(conversation.lastMessage.createdAt).time}</div>
                  {conversation.unreadCount > 0 && <span className="unread">{conversation.unreadCount}</span>}
                </span>
              </button>
            ))}
          </div>
        )}
        {view === "search" && (
          <div className="scroll" style={{ padding: 14 }}>
            <label className="field">
              <span className="label">Search users</span>
              <input className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name or username" />
            </label>
            <div style={{ marginTop: 12 }}>
              {results.map((user) => (
                <button key={user.id} className="person" type="button" onClick={() => openUser(user)}>
                  <span className="avatar">{initials(user.name, user.username)}<i className={`presence ${user.status === "ONLINE" ? "on" : ""}`} /></span>
                  <span>
                    <strong>{user.name}</strong>
                    <div className="hint">@{user.username} · {presenceLabel(user.status)}</div>
                  </span>
                </button>
              ))}
              {query.trim().length >= 2 && results.length === 0 && <p className="hint">No matching accounts.</p>}
            </div>
          </div>
        )}
        {view === "profile" && me && (
          <form className="scroll" style={{ padding: 16, display: "grid", gap: 12 }} onSubmit={saveProfile}>
            <Alert kind="ok">{notice}</Alert>
            <Alert kind="error">{error}</Alert>
            <label className="field"><span className="label">Name</span><input className="input" value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} /></label>
            <label className="field"><span className="label">Username</span><input className="input" value={profile.username} onChange={(event) => setProfile({ ...profile, username: event.target.value.toLowerCase() })} /></label>
            <label className="field"><span className="label">Phone</span><input className="input" value={me.phone ?? ""} disabled /></label>
            <label className="field"><span className="label">Bio</span><textarea className="textarea" value={profile.bio} onChange={(event) => setProfile({ ...profile, bio: event.target.value })} maxLength={280} /></label>
            <button className="btn btn-primary" type="submit">Save profile</button>
            <button className="btn btn-ghost" type="button" onClick={() => setView("settings")}>Settings</button>
          </form>
        )}
        {view === "settings" && (
          <div className="scroll" style={{ padding: 16, display: "grid", gap: 16 }}>
            <Alert kind="ok">{notice}</Alert>
            <Alert kind="error">{error}</Alert>
            <form onSubmit={changePassword} style={{ display: "grid", gap: 10 }}>
              <h2 style={{ margin: 0 }}>Password</h2>
              <input className="input" type="password" placeholder="Current password" value={passwords.currentPassword} onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })} />
              <input className="input" type="password" placeholder="New password" value={passwords.newPassword} onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })} />
              <input className="input" type="password" placeholder="Confirm password" value={passwords.confirmPassword} onChange={(event) => setPasswords({ ...passwords, confirmPassword: event.target.value })} />
              <button className="btn btn-primary" type="submit">Update password</button>
            </form>
            <p className="hint">Harbor stores messages so both people can read history. Traffic uses HTTPS in production. This is not end-to-end encryption.</p>
            <button className="btn btn-ghost" type="button" onClick={logout}>Log out</button>
            <form onSubmit={deleteAccount} style={{ display: "grid", gap: 8 }}>
              <h2 style={{ margin: 0 }}>Delete account</h2>
              <input className="input" type="password" placeholder="Confirm with password" value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} />
              <button className="btn btn-danger" type="submit">Delete account</button>
            </form>
          </div>
        )}
        <nav className="bottom-nav">
          <button className={view === "chats" ? "on" : ""} type="button" onClick={() => setView("chats")}>Chats</button>
          <button className={view === "search" ? "on" : ""} type="button" onClick={() => setView("search")}>Search</button>
          <button className={view === "profile" ? "on" : ""} type="button" onClick={() => setView("profile")}>Profile</button>
        </nav>
      </section>
      <section className="chat-pane">
        {view !== "chats" ? (
          <div className="scroll" style={{ padding: 28 }}>
            <p className="kicker">Harbor</p>
            <h1 style={{ fontSize: 56, marginTop: 8 }}>Use the panel.</h1>
            <p className="lede">Search, profile, and settings stay on the left on a wide screen.</p>
          </div>
        ) : !selectedId ? (
          <div className="scroll" style={{ padding: 28 }}>
            <p className="kicker">Conversations</p>
            <h1 style={{ fontSize: 56, marginTop: 8 }}>Pick someone.</h1>
            <p className="lede">Only registered Harbor accounts appear here. WhatsApp is not used to scrape personal chats.</p>
          </div>
        ) : (
          <>
            <div className="chat-head">
              <button className="btn btn-ghost btn-small" type="button" onClick={() => setSelectedId(null)}>Back</button>
              <div>
                <strong>{peer?.name || "Chat"}</strong>
                <div className="hint">{presenceLabel(peer?.status)}</div>
              </div>
            </div>
            <div className="scroll msg-stream" ref={stream}>
              <Alert kind="error">{error}</Alert>
              {messages.map((item, index) => {
                const mine = item.senderId === me?.id;
                const day = formatParts(item.createdAt).date;
                const previous = index > 0 ? formatParts(messages[index - 1]?.createdAt).date : "";
                return (
                  <div key={item.id}>
                    {day !== previous && <div className="day">{day}</div>}
                    <div className={`bubble ${mine ? "bubble-out" : "bubble-in"}`}>
                      {item.message}
                      <small>
                        {formatParts(item.createdAt).time}
                        {mine ? ` · ${item.readAt ? "Read" : "Sent"}` : ""}
                      </small>
                    </div>
                  </div>
                );
              })}
            </div>
            <form className="composer" onSubmit={send}>
              <input className="input" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Type a message..." maxLength={4000} disabled={peer?.status === "DISABLED"} />
              <button className="btn btn-primary" disabled={sending || !draft.trim() || peer?.status === "DISABLED"} type="submit">
                {sending ? "…" : "Send"}
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
