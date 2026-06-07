import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

type LikeRouteContext = {
  params: Promise<{ postId: string }>;
};

export async function POST(_request: Request, context: LikeRouteContext) {
  const session = await readSession();

  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { postId } = await context.params;
  const db = getDb();
  const post = await db.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });

  if (!post) {
    return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });
  }

  const existingLike = await db.postLike.findUnique({
    where: {
      postId_userId: {
        postId,
        userId: session.id,
      },
    },
  });

  const liked = !existingLike;

  if (existingLike) {
    await db.postLike.delete({
      where: { id: existingLike.id },
    });
  } else {
    await db.postLike.create({
      data: {
        postId,
        userId: session.id,
      },
    });
  }

  const count = await db.postLike.count({
    where: { postId },
  });

  return NextResponse.json({ liked, count });
}
