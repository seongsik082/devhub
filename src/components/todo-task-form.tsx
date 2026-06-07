"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type TodoTaskFormProps = {
  projectId: string;
};

export function TodoTaskForm({ projectId }: TodoTaskFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    const response = await fetch(`/api/todos/projects/${projectId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { error?: string };

    setIsLoading(false);

    if (!response.ok) {
      setError(data.error ?? "할 일을 만들지 못했습니다.");
      return;
    }

    form.reset();
    router.refresh();
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="title">할 일</label>
        <input id="title" name="title" required minLength={2} maxLength={120} />
      </div>
      <div className="field">
        <label htmlFor="dueDate">마감일</label>
        <input id="dueDate" name="dueDate" type="date" />
      </div>
      <div className="field">
        <label htmlFor="description">메모</label>
        <textarea className="textarea short" id="description" name="description" maxLength={1000} />
      </div>
      {error ? <p className="error">{error}</p> : null}
      <button className="button primary" disabled={isLoading} type="submit">
        {isLoading ? "추가 중..." : "할 일 추가"}
      </button>
    </form>
  );
}
