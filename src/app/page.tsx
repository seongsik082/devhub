import Link from "next/link";
import { ChatWidget } from "@/components/chat-widget";
import { LogoutButton } from "@/components/logout-button";
import { readSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { taskStatusLabels } from "@/lib/todo";
import { getSeoulWeather } from "@/lib/weather";
import { WeatherCard } from "@/components/weather-card";

export default async function Home() {
  const session = await readSession();
  const [posts, tasks, weather] = await Promise.all([
    getDb().post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true } },
        _count: { select: { comments: true, likes: true } },
      },
      take: 7,
    }),
    session
      ? getDb().todoTask.findMany({
          where: {
            project: { ownerId: session.id },
            status: { not: "DONE" },
          },
          orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
          include: {
            project: {
              select: { id: true, name: true },
            },
          },
          take: 7,
        })
      : Promise.resolve([]),
    getSeoulWeather(),
  ]);

  const primaryPost = posts[0];
  const secondaryPosts = posts.slice(1);

  return (
    <main className="portal-page">
      <div className="portal-container">
        <header className="portal-header">
          <div className="portal-topline">
            <Link className="portal-logo" href="/">
              DevHub
            </Link>
            <div className="portal-account">
              {session ? (
                <>
                  <span className="portal-greeting">{session.name}님</span>
                  <LogoutButton />
                </>
              ) : (
                <>
                  <Link className="button" href="/login">
                    로그인
                  </Link>
                  <Link className="button primary" href="/register">
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="portal-search">
            <span className="search-label">DevHub</span>
            <span className="search-copy">
              백엔드 실습 포털: 할 일, 게시판, 계정, 챗봇을 한 곳에서 확인하세요.
            </span>
          </div>

          <nav className="portal-menu" aria-label="주요 메뉴">
            <Link href="/">홈</Link>
            <Link href="/todos">할 일</Link>
            <Link href="/posts">게시판</Link>
            <Link href="/shop">쇼핑</Link>
            <Link href="/dashboard">대시보드</Link>
            {session?.role === "ADMIN" ? <Link href="/admin">관리자</Link> : null}
          </nav>
        </header>

        <section className="portal-grid">
          <aside className="portal-column stack">
            <section className="portal-card stack">
              <div className="portal-card-header">
                <div>
                  <strong>내 할 일</strong>
                  <p className="meta">완료 전 작업</p>
                </div>
                {session ? (
                  <Link className="small-link" href="/todos">
                    관리
                  </Link>
                ) : null}
              </div>

              {!session ? (
                <div className="portal-empty">
                  <strong>로그인이 필요합니다.</strong>
                  <span>로그인하면 내 할 일이 좌측에 표시됩니다.</span>
                  <Link className="button primary" href="/login?next=/todos">
                    로그인
                  </Link>
                </div>
              ) : tasks.length === 0 ? (
                <div className="portal-empty">
                  <strong>남은 할 일이 없습니다.</strong>
                  <span>새 프로젝트를 만들고 다음 작업을 정리해보세요.</span>
                  <Link className="button primary" href="/todos">
                    만들기
                  </Link>
                </div>
              ) : (
                <div className="portal-task-list">
                  {tasks.map((task) => (
                    <Link className="portal-task" href={`/todos/${task.project.id}`} key={task.id}>
                      <span className={`status-dot status-${task.status.toLowerCase()}`} />
                      <span>
                        <strong>{task.title}</strong>
                        <span className="meta">
                          {task.project.name} · {taskStatusLabels[task.status]}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section className="portal-card stack">
              <div className="portal-card-header">
                <strong>빠른 실행</strong>
              </div>
              <div className="quick-links">
                <Link href="/todos">프로젝트 만들기</Link>
                <Link href="/posts/new">게시글 쓰기</Link>
                <Link href="/shop">상품 둘러보기</Link>
                <Link href="/account/profile">프로필 수정</Link>
                <Link href="/account/password">비밀번호 변경</Link>
              </div>
            </section>
          </aside>

          <section className="portal-main stack">
            <section className="portal-card main-feed">
              <div className="portal-card-header">
                <div>
                  <strong>게시판</strong>
                  <p className="meta">최신 글과 실습 기록</p>
                </div>
                <Link className="small-link" href="/posts">
                  전체보기
                </Link>
              </div>

              {primaryPost ? (
                <article className="headline-post">
                  <div>
                    <span className="eyebrow">최신 글</span>
                    <h1>{primaryPost.title}</h1>
                    <p className="muted">{primaryPost.content.slice(0, 220)}</p>
                    <p className="meta">
                      {primaryPost.author.name} · {formatDateTime(primaryPost.createdAt)} · 댓글{" "}
                      {primaryPost._count.comments}개 · 좋아요 {primaryPost._count.likes}개
                    </p>
                  </div>
                  <Link
                    className="button primary"
                    href={
                      session
                        ? `/posts/${primaryPost.id}`
                        : `/login?next=/posts/${primaryPost.id}`
                    }
                  >
                    {session ? "자세히 보기" : "로그인하고 보기"}
                  </Link>
                </article>
              ) : (
                <div className="portal-empty">아직 게시글이 없습니다.</div>
              )}

              <div className="portal-post-list">
                {secondaryPosts.map((post) => (
                  <Link
                    className="portal-post-row"
                    href={session ? `/posts/${post.id}` : `/login?next=/posts/${post.id}`}
                    key={post.id}
                  >
                    <span>{post.title}</span>
                    <span className="meta">
                      댓글 {post._count.comments} · 좋아요 {post._count.likes}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          </section>

          <aside className="portal-column stack">
            <WeatherCard weather={weather} />

            <section className="portal-card stack">
              <div className="portal-card-header">
                <strong>MY</strong>
              </div>
              {session ? (
                <div className="profile-box">
                  <strong>{session.name}</strong>
                  <span className="meta">{session.email}</span>
                  <Link className="button primary" href="/dashboard">
                    내 대시보드
                  </Link>
                  <Link className="button" href="/cart">
                    장바구니
                  </Link>
                  <Link className="button" href="/account/profile">
                    프로필
                  </Link>
                </div>
              ) : (
                <div className="portal-empty">
                  <strong>DevHub에 로그인하세요.</strong>
                  <span>할 일 요약과 글 상세 기능을 사용할 수 있습니다.</span>
                  <Link className="button primary" href="/login">
                    로그인
                  </Link>
                </div>
              )}
            </section>

            <section className="portal-card stack">
              <div className="portal-card-header">
                <strong>챗봇</strong>
              </div>
              <p className="muted">
                우측 하단 Chat 버튼을 눌러 게시판, 할 일, 계정 기능 사용법을 물어보세요.
              </p>
            </section>

            <section className="portal-card stack">
              <div className="portal-card-header">
                <strong>현재 단계</strong>
              </div>
              <div className="mini-status-list">
                <span>인증 완료</span>
                <span>게시판/댓글 완료</span>
                <span>할 일 관리 완료</span>
                <span>챗봇 기본형 추가</span>
                <span>날씨 연결 추가</span>
                <span>쇼핑/주문 4차 진행</span>
                <span>프로필/첨부 5차 진행</span>
              </div>
            </section>
          </aside>
        </section>
      </div>
      <ChatWidget />
    </main>
  );
}
