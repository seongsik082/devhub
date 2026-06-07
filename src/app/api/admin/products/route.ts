import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { createAuditLog, getRequestMeta } from "@/lib/security";
import { productSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const session = await readSession();
  const requestMeta = getRequestMeta(request);

  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = productSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const product = await getDb().product.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      price: parsed.data.price,
      stock: parsed.data.stock,
      isActive: parsed.data.isActive,
    },
    select: { id: true },
  });

  await createAuditLog({
    actorId: session.id,
    action: "PRODUCT_CREATE",
    targetType: "Product",
    targetId: product.id,
    summary: `${session.email} created product ${parsed.data.name}`,
    metadata: {
      name: parsed.data.name,
      price: parsed.data.price,
      stock: parsed.data.stock,
      isActive: parsed.data.isActive,
    },
    ...requestMeta,
  });

  return NextResponse.json({ product }, { status: 201 });
}
