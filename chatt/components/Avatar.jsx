'use client';

import { useState } from 'react';
import { isOnline } from '@/lib/format';

export default function Avatar({ user, size = 42, showStatus = false }) {
  const [err, setErr] = useState(false);
  const name = user?.displayName || user?.username || '?';
  const letter = name[0]?.toUpperCase() || '?';
  const online = showStatus && user?.lastSeen && isOnline(user.lastSeen);

  return (
    <div className="avatar-wrap" style={{ width: size, height: size }}>
      {user?.avatarUrl && !err ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="avatar"
          src={user.avatarUrl}
          alt={name}
          width={size}
          height={size}
          onError={() => setErr(true)}
        />
      ) : (
        <div
          className="avatar avatar-fallback"
          style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
        >
          {letter}
        </div>
      )}
      {showStatus && <span className={`dot ${online ? 'online' : ''}`} />}
    </div>
  );
}
