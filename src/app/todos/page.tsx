import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { TodoProjectForm } from "@/components/todo-project-form";
import { readSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

export default async function TodosPage() {
  const session = await readSession();

  if (!session) {
    redirect("/login?next=/todos");
  }

  const projects = await getDb().todoProject.findMany({
    where: { ownerId: session.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { tasks: true } },
      tasks: {
        select: { status: true },
      },
    },
  });

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
            <LogoutButton />
          </div>
        </nav>

        <section className="section-header">
          <div>
            <span className="eyebrow">Milestone 3</span>
            <h1>할 일 관리</h1>
            <p className="muted">
              프로젝트별로 할 일을 나누고 상태를 바꾸며 사용자별 데이터 분리를 연습합니다.
            </p>
          </div>
        </section>

        <div className="two-column">
          <section className="panel stack">
            <h2>새 프로젝트</h2>
            <TodoProjectForm />
          </section>

          <section className="stack">
            {projects.length === 0 ? (
              <div className="panel stack">
                <strong>아직 프로젝트가 없습니다.</strong>
                <span className="muted">첫 프로젝트를 만들고 할 일을 추가해보세요.</span>
              </div>
            ) : (
              projects.map((project) => {
                const done = project.tasks.filter((task) => task.status === "DONE").length;
                const progress =
                  project._count.tasks === 0
                    ? 0
                    : Math.round((done / project._count.tasks) * 100);

                return (
                  <article className="panel post-item" key={project.id}>
                    <div>
                      <h2>{project.name}</h2>
                      {project.description ? (
                        <p className="muted">{project.description}</p>
                      ) : null}
                      <p className="meta">
                        할 일 {project._count.tasks}개 · 완료 {done}개 · 진행률 {progress}%
                      </p>
                    </div>
                    <div className="progress-track">
                      <div className="progress-bar" style={{ width: `${progress}%` }} />
                    </div>
                    <Link className="button primary" href={`/todos/${project.id}`}>
                      프로젝트 열기
                    </Link>
                  </article>
                );
              })
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
