'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

function WhatsAppLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#25d366" />
      <path
        d="M12 4.6a7.4 7.4 0 0 0-6.4 11.1L4.5 20l4.4-1.1A7.4 7.4 0 1 0 12 4.6Z"
        fill="#fff"
      />
      <path
        d="M9.5 8.6c-.2 0-.4 0-.6.3-.2.3-.8.8-.8 1.9s.8 2.2.9 2.3c.1.2 1.6 2.6 4 3.5 2 .8 2.4.6 2.8.6.4-.1 1.3-.5 1.5-1 .2-.5.2-1 .1-1.1-.1-.1-.2-.2-.4-.3l-1.5-.7c-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a5.9 5.9 0 0 1-2.9-2.6c-.1-.2 0-.3.1-.4l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.3 0-.5l-.7-1.6c-.2-.4-.3-.6-.5-.6Z"
        fill="#25d366"
      />
    </svg>
  );
}

function NeonIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id="tg-n" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="55%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <path d="M13 2 4.5 13.5H11L9.5 22 19 9.5h-6.5L13 2Z" fill="url(#tg-n)" />
    </svg>
  );
}

// icon = chat ke sidebar header ke andar wala chhota button
// default (floating) = baaki pages pe — /chat pe auto-HIDDEN (koi overlap nahi)
export default function ThemeToggle({ icon = false }) {
  const [theme, setTheme] = useState('neon');
  const pathname = usePathname();

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === 'whatsapp' ? 'whatsapp' : 'neon');
  }, []);

  function toggle() {
    const next = theme === 'neon' ? 'whatsapp' : 'neon';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('gx-theme', next);
    } catch {}
    setTheme(next);
  }

  const title = theme === 'neon' ? 'Switch to WhatsApp theme' : 'Switch to Neon theme';

  if (icon) {
    return (
      <button className="icon-btn" onClick={toggle} title={title}>
        {theme === 'neon' ? <WhatsAppLogo /> : <NeonIcon />}
      </button>
    );
  }

  // chat page pe floating button NAHI dikhega (wahan sidebar header me hai)
  if (pathname?.startsWith('/chat')) return null;

  return (
    <button className="theme-toggle" onClick={toggle} title={title}>
      {theme === 'neon' ? (
        <>
          <WhatsAppLogo />
          <span className="tt-text">WhatsApp</span>
        </>
      ) : (
        <>
          <NeonIcon />
          <span className="tt-text">Neon</span>
        </>
      )}
    </button>
  );
}
