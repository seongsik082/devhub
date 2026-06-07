import { redirect } from "next/navigation";
import { readSession } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await readSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="page-shell">
      <div className="container">
        <nav className="nav">
          <div>
            <div className="brand">DevHub</div>
            <p className="muted">안녕하세요, {session.name}님.</p>
          </div>
          <div className="nav-links">
            <Link className="button" href="/">
              홈
            </Link>
            <Link className="button" href="/posts">
              게시판
            </Link>
            <Link className="button" href="/todos">
              할 일
            </Link>
            <LogoutButton />
          </div>
        </nav>

        <section className="stack">
          <div>
            <h1>대시보드</h1>
            <p className="muted">
              인증, 게시판, 계정 보안, 할 일 관리 기능을 단계별로 확장하고 있습니다.
            </p>
          </div>

          <div className="dashboard-grid">
            <div className="panel stack">
              <strong>현재 단계</strong>
              <span className="muted">2차: 게시판과 댓글</span>
              <span className="muted">3차: 할 일 관리 진행 중</span>
            </div>
            <div className="panel stack">
              <strong>로그인 계정</strong>
              <span className="muted">{session.email}</span>
            </div>
            <div className="panel stack">
              <strong>권한</strong>
              <span className="muted">{session.role}</span>
            </div>
          </div>

          <div className="panel stack">
            <strong>게시판</strong>
            <span className="muted">
              글을 작성하고 댓글을 남기며 작성자 권한 체크를 연습합니다.
            </span>
            <div className="inline-actions">
              <Link className="button primary" href="/posts">
                게시판 보기
              </Link>
              <Link className="button" href="/posts/new">
                글쓰기
              </Link>
            </div>
          </div>

          <div className="panel stack">
            <strong>할 일 관리</strong>
            <span className="muted">
              프로젝트와 태스크를 만들고 상태 변경, 필터링, 사용자별 데이터 분리를 연습합니다.
            </span>
            <div className="inline-actions">
              <Link className="button primary" href="/todos">
                할 일 관리
              </Link>
            </div>
          </div>

          <div className="panel stack">
            <strong>계정 보안</strong>
            <span className="muted">
              현재 비밀번호를 확인하고 새 비밀번호로 변경하는 흐름을 연습합니다.
            </span>
            <div className="inline-actions">
              <Link className="button primary" href="/account/password">
                비밀번호 변경
              </Link>
              <Link className="button" href="/find-id">
                아이디 찾기 화면
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
