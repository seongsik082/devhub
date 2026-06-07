import { NextResponse } from "next/server";
import { readAdminSession } from "@/lib/admin";
import { getDb } from "@/lib/db";
import { createAuditLog, getRequestMeta } from "@/lib/security";
import { adminRoleSchema } from "@/lib/validation";

type AdminUserRouteContext = {
  params: Promise<{ userId: string }>;
};

export async function PATCH(request: Request, context: AdminUserRouteContext) {
  const admin = await readAdminSession();
  const requestMeta = getRequestMeta(request);

  if (!admin) {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  const { userId } = await context.params;

  if (userId === admin.id) {
    return NextResponse.json(
      { error: "자기 자신의 권한은 관리자 페이지에서 변경할 수 없습니다." },
      { status: 400 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = adminRoleSchema.safeParse(body);

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

  const updated = await getDb().user.update({
    where: { id: userId },
    data: { role: parsed.data.role },
    select: { id: true, role: true },
  });

  await createAuditLog({
    actorId: admin.id,
    action: "ROLE_CHANGE",
    targetType: "User",
    targetId: userId,
    summary: `${admin.email} changed user role to ${updated.role}`,
    metadata: { role: updated.role },
    ...requestMeta,
  });

  return NextResponse.json({ user: updated });
}
