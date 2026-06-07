import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

type CommentDeleteRouteContext = {
  params: Promise<{ postId: string; commentId: string }>;
};

export async function DELETE(_request: Request, context: CommentDeleteRouteContext) {
  const session = await readSession();

  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { postId, commentId } = await context.params;
  const comment = await getDb().comment.findFirst({
    where: {
      id: commentId,
      postId,
    },
    select: {
      id: true,
      authorId: true,
    },
  });

  if (!comment) {
    return NextResponse.json({ error: "댓글을 찾을 수 없습니다." }, { status: 404 });
  }

  if (comment.authorId !== session.id && session.role !== "ADMIN") {
    return NextResponse.json({ error: "삭제 권한이 없습니다." }, { status: 403 });
  }

  await getDb().comment.delete({
    where: { id: comment.id },
  });

  return NextResponse.json({ ok: true });
}
