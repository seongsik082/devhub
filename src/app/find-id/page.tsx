import Link from "next/link";
import { FindIdForm } from "@/components/find-id-form";

export default function FindIdPage() {
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
              <h1>아이디 찾기</h1>
              <p className="muted">
                가입 이름을 입력하면 일치하는 이메일 계정을 일부 가려서 보여줍니다.
              </p>
            </div>
            <FindIdForm />
          </div>
        </section>
      </div>
    </main>
  );
}
