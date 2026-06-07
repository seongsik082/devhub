import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DeleteTaskButton } from "@/components/delete-task-button";
import { LogoutButton } from "@/components/logout-button";
import { TaskStatusControl } from "@/components/task-status-control";
import { TodoTaskForm } from "@/components/todo-task-form";
import { readSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { taskStatusLabels } from "@/lib/todo";

type TodoProjectPageProps = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ status?: string }>;
};

export default async function TodoProjectPage({ params, searchParams }: TodoProjectPageProps) {
  const session = await readSession();

  if (!session) {
    redirect("/login?next=/todos");
  }

  const { projectId } = await params;
  const { status } = await searchParams;
  const statusFilter =
    status === "TODO" || status === "IN_PROGRESS" || status === "DONE" ? status : undefined;

  const project = await getDb().todoProject.findFirst({
    where: { id: projectId, ownerId: session.id },
    include: {
      tasks: {
        where: statusFilter ? { status: statusFilter } : undefined,
        orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
      },
    },
  });

  if (!project) {
    notFound();
  }

  return (
    <main className="page-shell">
      <div className="container">
        <nav className="nav">
          <Link className="brand" href="/">
            DevHub
          </Link>
          <div className="nav-links">
            <Link className="button" href="/todos">
              할 일
            </Link>
            <Link className="button" href="/dashboard">
              대시보드
            </Link>
            <LogoutButton />
          </div>
        </nav>

        <section className="section-header">
          <div>
            <h1>{project.name}</h1>
            {project.description ? <p className="muted">{project.description}</p> : null}
          </div>
          <div className="inline-actions">
            <Link className={!statusFilter ? "button primary" : "button"} href={`/todos/${project.id}`}>
              전체
            </Link>
            {(["TODO", "IN_PROGRESS", "DONE"] as const).map((item) => (
              <Link
                className={statusFilter === item ? "button primary" : "button"}
                href={`/todos/${project.id}?status=${item}`}
                key={item}
              >
                {taskStatusLabels[item]}
              </Link>
            ))}
          </div>
        </section>

        <div className="two-column">
          <section className="panel stack">
            <h2>할 일 추가</h2>
            <TodoTaskForm projectId={project.id} />
          </section>

          <section className="stack">
            {project.tasks.length === 0 ? (
              <div className="panel muted">조건에 맞는 할 일이 없습니다.</div>
            ) : (
              project.tasks.map((task) => (
                <article className="panel task-item" key={task.id}>
                  <div className="task-main">
                    <div>
                      <span className={`status-pill status-${task.status.toLowerCase()}`}>
                        {taskStatusLabels[task.status]}
                      </span>
                      <h2>{task.title}</h2>
                      {task.description ? <p className="muted">{task.description}</p> : null}
                      <p className="meta">
                        {task.dueDate
                          ? `마감 ${formatDateTime(task.dueDate)}`
                          : "마감일 없음"}
                      </p>
                    </div>
                    <DeleteTaskButton projectId={project.id} taskId={task.id} />
                  </div>
                  <TaskStatusControl projectId={project.id} status={task.status} taskId={task.id} />
                </article>
              ))
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
