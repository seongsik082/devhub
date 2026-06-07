import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import { commentSchema } from "@/lib/validation";

type CommentRouteContext = {
  params: Promise<{ postId: string }>;
};

export async function POST(request: Request, context: CommentRouteContext) {
  const session = await readSession();

  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { postId } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = commentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const post = await getDb().post.findUnique({
    where: { id: postId },
    select: { id: true, title: true, authorId: true },
  });

  if (!post) {
    return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });
  }

  const comment = await getDb().comment.create({
    data: {
      content: parsed.data.content,
      postId,
      authorId: session.id,
    },
    select: {
      id: true,
    },
  });

  if (post.authorId !== session.id) {
    await createNotification({
      userId: post.authorId,
      type: "COMMENT",
      title: "새 댓글이 달렸습니다",
      message: `${session.name}님이 "${post.title}" 글에 댓글을 남겼습니다.`,
      link: `/posts/${post.id}`,
    });
  }

  return NextResponse.json({ comment }, { status: 201 });
}
