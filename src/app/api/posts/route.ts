import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { postSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const session = await readSession();

  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = postSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const post = await getDb().post.create({
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      authorId: session.id,
    },
    select: {
      id: true,
      title: true,
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}
