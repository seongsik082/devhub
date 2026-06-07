import Link from "next/link";
import { redirect } from "next/navigation";
import { readSession } from "@/lib/auth";
import { AuthForm } from "@/components/auth-form";

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

function getSafeRedirect(next?: string) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }

  return next;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await readSession();
  const { next } = await searchParams;
  const redirectTo = getSafeRedirect(next);

  if (session) {
    redirect(redirectTo);
  }

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
            <Link className="button" href="/register">
              회원가입
            </Link>
          </div>
        </nav>

        <section className="panel" style={{ maxWidth: 480, margin: "0 auto" }}>
          <div className="stack">
            <div>
              <h1>로그인</h1>
              <p className="muted">가입한 계정으로 로그인하면 보려던 화면으로 이동합니다.</p>
            </div>
            <AuthForm mode="login" redirectTo={redirectTo} />
            <div className="inline-actions">
              <Link className="button" href="/find-id">
                아이디 찾기
              </Link>
              <Link className="button" href="/register">
                새 계정 만들기
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
