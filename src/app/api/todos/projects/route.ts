import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { todoProjectSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const session = await readSession();

  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = todoProjectSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const project = await getDb().todoProject.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      ownerId: session.id,
    },
    select: { id: true },
  });

  return NextResponse.json({ project }, { status: 201 });
}
