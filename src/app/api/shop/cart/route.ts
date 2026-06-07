import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { cartSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const session = await readSession();

  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = cartSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const product = await getDb().product.findUnique({
    where: { id: parsed.data.productId },
    select: { id: true, isActive: true, stock: true },
  });

  if (!product || !product.isActive) {
    return NextResponse.json({ error: "판매 중인 상품이 아닙니다." }, { status: 404 });
  }

  if (product.stock < parsed.data.quantity) {
    return NextResponse.json({ error: "재고가 부족합니다." }, { status: 400 });
  }

  const existing = await getDb().cartItem.findUnique({
    where: { userId_productId: { userId: session.id, productId: product.id } },
    select: { quantity: true },
  });

  if (existing && existing.quantity + parsed.data.quantity > product.stock) {
    return NextResponse.json({ error: "장바구니 수량이 재고보다 많습니다." }, { status: 400 });
  }

  await getDb().cartItem.upsert({
    where: { userId_productId: { userId: session.id, productId: product.id } },
    create: {
      userId: session.id,
      productId: product.id,
      quantity: parsed.data.quantity,
    },
    update: {
      quantity: { increment: parsed.data.quantity },
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
