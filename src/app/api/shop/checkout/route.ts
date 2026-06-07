import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST() {
  const session = await readSession();

  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const order = await getDb().$transaction(async (tx) => {
      const cartItems = await tx.cartItem.findMany({
        where: { userId: session.id },
        select: {
          productId: true,
          quantity: true,
          product: {
            select: {
              name: true,
              price: true,
              stock: true,
              isActive: true,
            },
          },
        },
      });

      if (cartItems.length === 0) {
        throw new Error("장바구니가 비어 있습니다.");
      }

      for (const item of cartItems) {
        if (!item.product.isActive || item.product.stock < item.quantity) {
          throw new Error(`${item.product.name} 상품의 재고가 부족합니다.`);
        }
      }

      for (const item of cartItems) {
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        if (updated.count !== 1) {
          throw new Error(`${item.product.name} 상품의 재고가 부족합니다.`);
        }
      }

      const totalAmount = cartItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0,
      );

      const createdOrder = await tx.order.create({
        data: {
          userId: session.id,
          totalAmount,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              productName: item.product.name,
              unitPrice: item.product.price,
              quantity: item.quantity,
              subtotal: item.product.price * item.quantity,
            })),
          },
        },
        select: { id: true },
      });

      await tx.cartItem.deleteMany({ where: { userId: session.id } });

      return createdOrder;
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "주문을 생성하지 못했습니다." },
      { status: 400 },
    );
  }
}
