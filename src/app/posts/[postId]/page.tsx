import Link from "next/link";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { readSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { CommentForm } from "@/components/comment-form";
import { DeletePostButton } from "@/components/delete-post-button";
import { DeleteCommentButton } from "@/components/delete-comment-button";
import { LikeButton } from "@/components/like-button";
import { LogoutButton } from "@/components/logout-button";

type PostDetailPageProps = {
  params: Promise<{ postId: string }>;
};

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { postId } = await params;
  const [session, post] = await Promise.all([
    readSession(),
    getDb().post.findUnique({
      where: { id: postId },
      include: {
        author: { select: { id: true, name: true, email: true, bio: true, avatarUrl: true } },
        attachments: {
          orderBy: { createdAt: "asc" },
        },
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            author: { select: { id: true, name: true } },
          },
        },
        likes: {
          select: { userId: true },
        },
        _count: {
          select: { likes: true },
        },
      },
    }),
  ]);

  if (!post) {
    notFound();
  }

  if (!session) {
    redirect(`/login?next=/posts/${post.id}`);
  }

  const canDeletePost = session?.id === post.authorId || session?.role === "ADMIN";
  const isLiked = post.likes.some((like) => like.userId === session?.id);

  return (
    <main className="page-shell">
      <div className="container">
        <nav className="nav">
          <Link className="brand" href="/">
            DevHub
          </Link>
          <div className="nav-links">
            <Link className="button" href="/">
              홈
            </Link>
            <Link className="button" href="/posts">
              게시판
            </Link>
            {session ? (
              <>
                <Link className="button" href="/dashboard">
                  대시보드
                </Link>
                <LogoutButton />
              </>
            ) : (
              <Link className="button primary" href="/login">
                로그인
              </Link>
            )}
          </div>
        </nav>

        <article className="panel post-detail stack">
          <div className="section-header">
            <div>
              <h1>{post.title}</h1>
              <div className="post-author-line">
                {post.author.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt={`${post.author.name} 프로필`} src={post.author.avatarUrl} />
                ) : (
                  <span>{post.author.name.slice(0, 1)}</span>
                )}
                <p className="meta">
                  {post.author.name} · {formatDateTime(post.createdAt)} · 좋아요{" "}
                  {post._count.likes}개
                </p>
              </div>
              {post.author.bio ? <p className="muted">{post.author.bio}</p> : null}
            </div>
            <div className="inline-actions">
              {session ? (
                <LikeButton
                  initialCount={post._count.likes}
                  initialLiked={isLiked}
                  postId={post.id}
                />
              ) : null}
              {canDeletePost ? <DeletePostButton postId={post.id} /> : null}
            </div>
          </div>
          <div className="prose">{post.content}</div>

          {post.attachments.length > 0 ? (
            <section className="attachment-list">
              <h2>첨부파일 {post.attachments.length}개</h2>
              <div className="attachment-grid">
                {post.attachments.map((attachment) => (
                  <a
                    className="attachment-card"
                    download={attachment.fileName}
                    href={attachment.dataUrl}
                    key={attachment.id}
                  >
                    {attachment.mimeType.startsWith("image/") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img alt={attachment.fileName} src={attachment.dataUrl} />
                    ) : (
                      <div className="attachment-file-icon">FILE</div>
                    )}
                    <span>
                      <strong>{attachment.fileName}</strong>
                      <span className="meta">{Math.ceil(attachment.size / 1024)}KB</span>
                    </span>
                  </a>
                ))}
              </div>
            </section>
          ) : null}
        </article>

        <section className="stack" style={{ marginTop: 24 }}>
          <div className="section-header">
            <div>
              <h2>댓글 {post.comments.length}개</h2>
              <p className="muted">댓글은 로그인한 사용자만 작성할 수 있습니다.</p>
            </div>
          </div>

          {session ? (
            <div className="panel">
              <CommentForm postId={post.id} />
            </div>
          ) : (
            <div className="panel inline-actions">
              <span className="muted">댓글을 작성하려면 로그인해주세요.</span>
              <Link className="button primary" href="/login">
                로그인
              </Link>
            </div>
          )}

          <div className="post-list">
            {post.comments.length === 0 ? (
              <div className="panel muted">아직 댓글이 없습니다.</div>
            ) : (
              post.comments.map((comment) => {
                const canDeleteComment =
                  session?.id === comment.authorId || session?.role === "ADMIN";

                return (
                  <article className="panel stack" key={comment.id}>
                    <div className="section-header" style={{ marginBottom: 0 }}>
                      <div>
                        <strong>{comment.author.name}</strong>
                        <p className="meta">{formatDateTime(comment.createdAt)}</p>
                      </div>
                      {canDeleteComment ? (
                        <DeleteCommentButton commentId={comment.id} postId={post.id} />
                      ) : null}
                    </div>
                    <div className="prose">{comment.content}</div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
