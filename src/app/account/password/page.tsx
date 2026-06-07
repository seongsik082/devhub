import Link from "next/link";
import { redirect } from "next/navigation";
import { ChangePasswordForm } from "@/components/change-password-form";
import { readSession } from "@/lib/auth";

export default async function ChangePasswordPage() {
  const session = await readSession();

  if (!session) {
    redirect("/login?next=/account/password");
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
            <Link className="button" href="/dashboard">
              대시보드
            </Link>
          </div>
        </nav>

        <section className="panel" style={{ maxWidth: 560, margin: "0 auto" }}>
          <div className="stack">
            <div>
              <h1>비밀번호 변경</h1>
              <p className="muted">
                현재 비밀번호를 확인한 뒤 새 비밀번호로 변경합니다.
              </p>
            </div>
            <ChangePasswordForm />
          </div>
        </section>
      </div>
    </main>
  );
}
