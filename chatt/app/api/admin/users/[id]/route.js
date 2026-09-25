import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { findUserById, updateUser, addMessage } from '@/lib/db';

export const dynamic = 'force-dynamic';

// PATCH /api/admin/users/[id] { action: 'promote' | 'demote' }
// promote = user ko real admin banana (isAdmin) — admin panel + sab power milegi,
//           aur unke naam ke saamne green neon ADMIN label aata hai sabko.
export async function PATCH(req, { params }) {
  const me = await getCurrentUser(req);
  if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!me.isAdmin) return NextResponse.json({ error: 'Admins only' }, { status: 403 });

  const id = params?.id;
  const { action } = await req.json().catch(() => ({}));
  if (!['promote', 'demote'].includes(action)) {
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }

  const target = await findUserById(id);
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if (id === me.id) {
    return NextResponse.json({ error: 'You cannot change your own status' }, { status: 400 });
  }

  const mod = action === 'promote';
  if (mod && target.isAdmin) {
    return NextResponse.json({ error: 'This user is already an admin' }, { status: 400 });
  }

  await updateUser(id, { isAdmin: mod });

  if (mod) {
    // "now you are admin" message — promoted user ke paas chala jaaye
    try {
      await addMessage(
        me.id,
        id,
        '🎉 Congratulations! You are now an Admin of GodxShadow 🟢✨ Open the shield icon in your chat sidebar — the admin panel and all powers are unlocked for you. Wear the green ADMIN badge with pride!'
      );
    } catch {}
  }

  return NextResponse.json({ ok: true, isAdmin: mod });
}
