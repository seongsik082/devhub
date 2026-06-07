import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { getDb } from "@/lib/db";
import { readSession } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import { formatDateTime } from "@/lib/format";

type PostsPageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

function buildPostsPageHref(page: number, query: string) {
  const params = new URLSearchParams();
  if (query) {
    params.set("q", query);
  }
  if (page > 1) {
    params.set("page", String(page));
  }
  const search = params.toString();
  return search ? `/posts?${search}` : "/posts";
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const params = await searchParams;
  const query = (params.q ?? "").trim();
  const currentPage = Math.max(Number(params.page ?? "1") || 1, 1);
  const pageSize = 5;
  const where: Prisma.PostWhereInput = query
    ? {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
          { author: { name: { contains: query, mode: "insensitive" } } },
        ],
      }
    : {};

  const [session, posts, totalPosts] = await Promise.all([
    readSession(),
    getDb().post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true } },
        _count: { select: { comments: true, likes: true } },
      },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
    getDb().post.count({ where }),
  ]);
  const totalPages = Math.max(Math.ceil(totalPosts / pageSize), 1);

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
              <p className="muted">
                글 목록, 상세 조회, 댓글 흐름을 연습합니다. 제목, 본문, 작성자로 검색할 수
                있습니다.
              </p>
            </div>
            {session ? (
              <Link className="button primary" href="/posts/new">
                글쓰기
              </Link>
            ) : null}
          </div>

          <form className="search-toolbar" action="/posts">
            <input
              aria-label="게시글 검색"
              defaultValue={query}
              name="q"
              placeholder="게시글 제목, 본문, 작성자 검색"
            />
            <button className="button primary" type="submit">
              검색
            </button>
            {query ? (
              <Link className="button" href="/posts">
                초기화
              </Link>
            ) : null}
          </form>

          <p className="meta result-meta">
            {query ? `"${query}" 검색 결과 ` : "전체 게시글 "}
            {totalPosts}개
          </p>

          <div className="post-list">
            {posts.length === 0 ? (
              <div className="panel stack">
                <strong>조건에 맞는 글이 없습니다.</strong>
                <span className="muted">검색어를 바꾸거나 첫 글을 작성해보세요.</span>
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

          {totalPages > 1 ? (
            <nav className="pagination" aria-label="게시글 페이지">
              <Link
                className={`button ${currentPage <= 1 ? "disabled" : ""}`}
                href={buildPostsPageHref(Math.max(currentPage - 1, 1), query)}
              >
                이전
              </Link>
              <span className="meta">
                {currentPage} / {totalPages}
              </span>
              <Link
                className={`button ${currentPage >= totalPages ? "disabled" : ""}`}
                href={buildPostsPageHref(Math.min(currentPage + 1, totalPages), query)}
              >
                다음
              </Link>
            </nav>
          ) : null}
        </section>
      </div>
    </main>
  );
}
