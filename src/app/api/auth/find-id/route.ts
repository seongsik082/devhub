import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { maskEmail } from "@/lib/mask";
import { findIdSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = findIdSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const users = await getDb().user.findMany({
    where: {
      name: parsed.data.name,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      email: true,
      createdAt: true,
    },
    take: 5,
  });

  return NextResponse.json({
    accounts: users.map((user) => ({
      email: maskEmail(user.email),
      createdAt: user.createdAt,
    })),
  });
}
