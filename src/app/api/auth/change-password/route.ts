import { compare, hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { changePasswordSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const session = await readSession();

  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = changePasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  if (parsed.data.currentPassword === parsed.data.newPassword) {
    return NextResponse.json(
      { error: "새 비밀번호는 현재 비밀번호와 달라야 합니다." },
      { status: 400 },
    );
  }

  const user = await getDb().user.findUnique({
    where: { id: session.id },
    select: { id: true, passwordHash: true },
  });

  if (!user) {
    return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
  }

  const isCurrentPasswordValid = await compare(
    parsed.data.currentPassword,
    user.passwordHash,
  );

  if (!isCurrentPasswordValid) {
    return NextResponse.json({ error: "현재 비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const passwordHash = await hash(parsed.data.newPassword, 12);

  await getDb().user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return NextResponse.json({ ok: true });
}
