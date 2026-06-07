import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { registerSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const db = getDb();
  const existingUser = await db.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (existingUser) {
    return NextResponse.json({ error: "이미 가입된 이메일입니다." }, { status: 409 });
  }

  const passwordHash = await hash(parsed.data.password, 12);
  const user = await db.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      passwordHash,
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
