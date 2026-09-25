import Link from "next/link";
import { Mark, ThemeToggle } from "@/components/ui";

export default function HomePage() {
  return (
    <main id="main">
      <div className="hero">
        <div className="topbar">
          <Link className="brand" href="/">
            <Mark />
            <span>Harbor</span>
          </Link>
          <div style={{ display: "flex", gap: 8 }}>
            <ThemeToggle />
            <Link className="btn btn-ghost btn-small" href="/login">
              Sign in
            </Link>
          </div>
        </div>
        <div className="hero-grid" style={{ marginTop: 42 }}>
          <div>
            <p className="kicker">Phone-verified chat</p>
            <h1>A quieter room, with the door locked.</h1>
            <p className="lede">
              Harbor is for people you already know. A phone number is verified before an account exists, passwords are hashed, and the admin console is a separate door.
            </p>
            <div className="actions">
              <Link className="btn btn-primary" href="/signup">
                Create account
              </Link>
              <Link className="btn btn-ghost" href="/login">
                I already have one
              </Link>
            </div>
            <div className="specs">
              <div className="spec">
                <b>01</b>
                <strong>Verified first</strong>
                <p className="hint">OTP through a configured authorized provider. Codes are hashed and expire in five minutes.</p>
              </div>
              <div className="spec">
                <b>02</b>
                <strong>Your circle</strong>
                <p className="hint">Chat with other Harbor accounts. History, read receipts, and presence live in PostgreSQL.</p>
              </div>
              <div className="spec">
                <b>03</b>
                <strong>Official WhatsApp</strong>
                <p className="hint">Admin connects the WhatsApp Business Platform. No Web session, no QR hijack, no per-user session.</p>
              </div>
            </div>
          </div>
          <div className="card phone-mock" aria-hidden="true">
            <header>
              <div>
                <strong>Aman</strong>
                <div className="hint">Online</div>
              </div>
              <span className="badge badge-ok"><span className="dot" /> Harbor</span>
            </header>
            <div className="bubble bubble-in">
              Platform is up. OTP template is the Cloud API one, not a web session.
              <small>09:18 AM</small>
            </div>
            <div className="bubble bubble-out">
              Good. Keep the admin connection global — don’t pin it to every user.
              <small>09:19 AM · Read</small>
            </div>
            <div className="bubble bubble-in">
              Understood. User table sits under the connection card.
              <small>09:20 AM</small>
            </div>
            <p className="hint" style={{ marginTop: "auto" }}>
              Messages are stored for delivery. Harbor is encrypted in transit, not end-to-end encrypted.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
