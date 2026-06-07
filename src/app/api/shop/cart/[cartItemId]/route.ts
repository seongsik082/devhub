import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { cartQuantitySchema } from "@/lib/validation";

type RouteContext = {
  params: Promise<{ cartItemId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await readSession();

  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { cartItemId } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = cartQuantitySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const item = await getDb().cartItem.findFirst({
    where: { id: cartItemId, userId: session.id },
    include: { product: { select: { stock: true, isActive: true } } },
  });

  if (!item) {
    return NextResponse.json({ error: "장바구니 상품을 찾지 못했습니다." }, { status: 404 });
  }

  if (!item.product.isActive || item.product.stock < parsed.data.quantity) {
    return NextResponse.json({ error: "구매 가능한 재고가 부족합니다." }, { status: 400 });
  }

  await getDb().cartItem.update({
    where: { id: item.id },
    data: { quantity: parsed.data.quantity },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await readSession();

  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { cartItemId } = await context.params;
  const item = await getDb().cartItem.findFirst({
    where: { id: cartItemId, userId: session.id },
    select: { id: true },
  });

  if (!item) {
    return NextResponse.json({ error: "장바구니 상품을 찾지 못했습니다." }, { status: 404 });
  }

  await getDb().cartItem.delete({ where: { id: item.id } });

  return NextResponse.json({ ok: true });
}
