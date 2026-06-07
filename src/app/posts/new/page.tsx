import Link from "next/link";
import { redirect } from "next/navigation";
import { readSession } from "@/lib/auth";
import { PostForm } from "@/components/post-form";

export default async function NewPostPage() {
  const session = await readSession();

  if (!session) {
    redirect("/login");
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
            <Link className="button" href="/posts">
              게시판
            </Link>
          </div>
        </nav>

        <section className="panel" style={{ maxWidth: 760, margin: "0 auto" }}>
          <div className="stack">
            <div>
              <h1>글쓰기</h1>
              <p className="muted">로그인한 사용자만 글을 작성할 수 있습니다.</p>
            </div>
            <PostForm />
          </div>
        </section>
      </div>
    </main>
  );
}
