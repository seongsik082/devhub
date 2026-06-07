import Link from "next/link";
import { getDb } from "@/lib/db";
import { readSession } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import { formatDateTime } from "@/lib/format";

export default async function PostsPage() {
  const [session, posts] = await Promise.all([
    readSession(),
    getDb().post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true } },
        _count: { select: { comments: true, likes: true } },
      },
      take: 30,
    }),
  ]);

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

        <section>
          <div className="section-header">
            <div>
              <h1>게시판</h1>
              <p className="muted">글 목록, 상세 조회, 댓글 흐름을 연습합니다.</p>
            </div>
            {session ? (
              <Link className="button primary" href="/posts/new">
                글쓰기
              </Link>
            ) : null}
          </div>

          <div className="post-list">
            {posts.length === 0 ? (
              <div className="panel stack">
                <strong>아직 글이 없습니다.</strong>
                <span className="muted">첫 글을 작성해서 게시판 흐름을 시작해보세요.</span>
              </div>
            ) : (
              posts.map((post) => (
                <article className="panel post-item" key={post.id}>
                  <div>
                    <h2>
                      <Link href={`/posts/${post.id}`}>{post.title}</Link>
                    </h2>
                    <p className="meta">
                      {post.author.name} · {formatDateTime(post.createdAt)} · 댓글{" "}
                      {post._count.comments}개 · 좋아요 {post._count.likes}개
                    </p>
                  </div>
                  <p className="muted">{post.content.slice(0, 160)}</p>
                  <Link className="button" href={`/posts/${post.id}`}>
                    자세히 보기
                  </Link>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
