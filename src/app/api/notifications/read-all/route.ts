import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function PATCH() {
  const session = await readSession();

  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  await getDb().notification.updateMany({
    where: { userId: session.id, readAt: null },
    data: { readAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
