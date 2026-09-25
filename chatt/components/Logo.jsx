// GodxShadow logo — single premium app-icon card har jagah:
// dark rounded square + glowing cyan-violet-pink orb + GS monogram.
// .logo-box wrapper hamesha glow pulse + glass-shine sweep chalata hai (globals.css).
export default function Logo({ size = 34, boxed = false }) {
  const small = size < 46;
  return (
    <span className="logo-box" role="img" aria-label="GodxShadow logo">
      <svg width={size} height={size} viewBox="0 0 96 96" fill="none">
        <defs>
          <linearGradient id="gxcard" x1="0" y1="0" x2="96" y2="96" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1b1035" />
            <stop offset="100%" stopColor="#0a0d1c" />
          </linearGradient>
          <linearGradient id="gxorb" x1="20" y1="20" x2="78" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="48%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <linearGradient id="gxring" x1="0" y1="96" x2="96" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(34,211,238,0.9)" />
            <stop offset="50%" stopColor="rgba(139,92,246,0.9)" />
            <stop offset="100%" stopColor="rgba(236,72,153,0.9)" />
          </linearGradient>
          <radialGradient id="gxhalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.42" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="48" cy="48" rx="46" ry="46" fill="url(#gxhalo)" />
        <rect
          x={7}
          y={7}
          width={82}
          height={82}
          rx={24}
          fill="url(#gxcard)"
          stroke="url(#gxring)"
          strokeWidth={2.4}
        />
        <path
          d="M31 10h34c11.6 0 21 8.2 21 24 0 4-18 2-31 2s-45 4-45-6c0-12 9.4-20 21-20z"
          fill="rgba(255,255,255,0.07)"
        />
        <circle cx="48" cy="48" r="26" fill="url(#gxorb)" />
        <ellipse cx="40" cy="39" rx="12" ry="8" fill="rgba(255,255,255,0.35)" transform="rotate(-24 40 39)" />
        <text
          x="48"
          y={small ? 60 : 56}
          textAnchor="middle"
          fontFamily="system-ui, -apple-system, Segoe UI, sans-serif"
          fontWeight="900"
          fontSize={small ? 32 : 25}
          fill="#ffffff"
          letterSpacing="-0.5"
        >
          GS
        </text>
      </svg>
    </span>
  );
}
