import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

type RouteContext = {
  params: Promise<{ notificationId: string }>;
};

export async function PATCH(_request: Request, context: RouteContext) {
  const session = await readSession();

  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { notificationId } = await context.params;
  const notification = await getDb().notification.findFirst({
    where: { id: notificationId, userId: session.id },
    select: { id: true },
  });

  if (!notification) {
    return NextResponse.json({ error: "알림을 찾을 수 없습니다." }, { status: 404 });
  }

  await getDb().notification.update({
    where: { id: notification.id },
    data: { readAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
