import Link from "next/link";

export default function NotFound() {
  return (
    <main className="auth-wrap" id="main">
      <div className="card auth-card">
        <p className="kicker">404</p>
        <h1 style={{ fontSize: 48, margin: "8px 0" }}>That page drifted.</h1>
        <p className="hint">The address is not part of Harbor.</p>
        <Link className="btn btn-primary" href="/" style={{ marginTop: 16 }}>
          Back home
        </Link>
      </div>
    </main>
  );
}
