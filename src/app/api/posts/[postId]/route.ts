import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

type PostRouteContext = {
  params: Promise<{ postId: string }>;
};

export async function DELETE(_request: Request, context: PostRouteContext) {
  const session = await readSession();

  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { postId } = await context.params;
  const post = await getDb().post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true },
  });

  if (!post) {
    return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });
  }

  if (post.authorId !== session.id && session.role !== "ADMIN") {
    return NextResponse.json({ error: "삭제 권한이 없습니다." }, { status: 403 });
  }

  await getDb().post.delete({
    where: { id: postId },
  });

  return NextResponse.json({ ok: true });
}
