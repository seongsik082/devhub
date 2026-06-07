import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { readAdminSession } from "@/lib/admin";
import { getDb } from "@/lib/db";
import { adminPasswordSchema } from "@/lib/validation";

type AdminPasswordRouteContext = {
  params: Promise<{ userId: string }>;
};

export async function PATCH(request: Request, context: AdminPasswordRouteContext) {
  const admin = await readAdminSession();

  if (!admin) {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  const { userId } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = adminPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const target = await getDb().user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!target) {
    return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
  }

  const passwordHash = await hash(parsed.data.newPassword, 12);

  await getDb().user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return NextResponse.json({ ok: true });
}
