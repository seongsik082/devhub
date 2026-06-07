import { NextResponse } from "next/server";
import { readSession, setSessionCookie } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { profileSchema } from "@/lib/validation";

export async function PATCH(request: Request) {
  const session = await readSession();

  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = profileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const user = await getDb().user.update({
    where: { id: session.id },
    data: {
      name: parsed.data.name,
      bio: parsed.data.bio || null,
      avatarUrl: parsed.data.avatarUrl || null,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  await setSessionCookie(user);

  return NextResponse.json({ user });
}
