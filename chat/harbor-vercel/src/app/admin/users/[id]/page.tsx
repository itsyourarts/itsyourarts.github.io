"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Alert, api, formatParts } from "@/components/ui";

type AdminUser = {
  name: string | null;
  username: string | null;
  phone: string | null;
  verification: string;
  accountStatus: string;
  presence: string;
  createdAt: string;
  lastLoginAt: string | null;
  bio: string | null;
};

export default function AdminUserPage() {
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params.id) return;
    api<{ user: AdminUser }>(`/api/admin/users/${params.id}`).then((data) => {
      if (!data.success) setError(data.message || "User not found.");
      else setUser(data.user);
    });
  }, [params.id]);

  const created = formatParts(user?.createdAt);
  const login = formatParts(user?.lastLoginAt);

  return (
    <main className="auth-wrap" id="main">
      <div className="card auth-card">
        <Link href="/admin">Back to dashboard</Link>
        <h1 style={{ fontSize: 40 }}>User details</h1>
        <Alert kind="error">{error}</Alert>
        {user && (
          <dl style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 8 }}>
            <dt>Name</dt><dd>{user.name || "—"}</dd>
            <dt>Username</dt><dd>{user.username || "—"}</dd>
            <dt>Phone</dt><dd>{user.phone || "—"}</dd>
            <dt>Verification</dt><dd>{user.verification}</dd>
            <dt>Account status</dt><dd>{user.accountStatus}</dd>
            <dt>Presence</dt><dd>{user.presence}</dd>
            <dt>Created</dt><dd>{created.date} {created.time}</dd>
            <dt>Last login</dt><dd>{user.lastLoginAt ? `${login.date} ${login.time}` : "—"}</dd>
            <dt>Bio</dt><dd>{user.bio || "—"}</dd>
          </dl>
        )}
      </div>
    </main>
  );
}
