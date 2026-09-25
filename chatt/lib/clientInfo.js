// Request se IP + User-Agent nikalna (Vercel pe x-forwarded-for se real IP milti hai)
export function clientInfo(req) {
  const ip =
    (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
  const ua = req.headers.get('user-agent') || 'unknown';
  return { ip, ua };
}
