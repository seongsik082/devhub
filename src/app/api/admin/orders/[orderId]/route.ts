import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import { orderStatusLabels } from "@/lib/shop";
import { adminOrderStatusSchema } from "@/lib/validation";

type RouteContext = {
  params: Promise<{ orderId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await readSession();

  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  const { orderId } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = adminOrderStatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const order = await getDb().order.update({
    where: { id: orderId },
    data: { status: parsed.data.status },
    select: { id: true, status: true, userId: true },
  });

  await createNotification({
    userId: order.userId,
    type: "ORDER",
    title: "주문 상태가 변경되었습니다",
    message: `주문 ${order.id.slice(-8)} 상태가 '${orderStatusLabels[order.status]}'(으)로 변경되었습니다.`,
    link: "/orders",
  });

  return NextResponse.json({ order });
}
