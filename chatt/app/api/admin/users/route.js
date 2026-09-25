import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { deleteUser, findUserById } from '@/lib/db';

export const dynamic = 'force-dynamic';

// DELETE /api/admin/users { id } — admin kisi bhi NAAMALUM user ka account delete kar sakta hai
// (admin users ko delete nahi kar sakte — pehle demote karna hoga)
export async function DELETE(req) {
  const me = await getCurrentUser(req);
  if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!me.isAdmin) return NextResponse.json({ error: 'Admins only' }, { status: 403 });

  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: 'User id is required' }, { status: 400 });
  if (id === me.id) {
    return NextResponse.json(
      { error: 'You cannot delete your own admin account' },
      { status: 400 }
    );
  }

  // admins ko delete nahi kar sakte — pehle demote karna hoga
  try {
    const target = await findUserById(id);
    if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (target.isAdmin) {
      return NextResponse.json(
        { error: 'Admin accounts cannot be deleted — demote first' },
        { status: 400 }
      );
    }
    await deleteUser(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e.code === 'NOT_FOUND') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Delete failed: ' + e.message }, { status: 500 });
  }
}
