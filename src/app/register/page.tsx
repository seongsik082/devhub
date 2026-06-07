import Link from "next/link";
import { redirect } from "next/navigation";
import { readSession } from "@/lib/auth";
import { AuthForm } from "@/components/auth-form";

export default async function RegisterPage() {
  const session = await readSession();

  if (session) {
    redirect("/dashboard");
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
            <Link className="button" href="/login">
              로그인
            </Link>
          </div>
        </nav>

        <section className="panel" style={{ maxWidth: 520, margin: "0 auto" }}>
          <div className="stack">
            <div>
              <h1>회원가입</h1>
              <p className="muted">첫 계정을 만들고 이후 기능을 하나씩 붙여갑니다.</p>
            </div>
            <AuthForm mode="register" />
          </div>
        </section>
      </div>
    </main>
  );
}
