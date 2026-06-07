"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function TodoProjectForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    const response = await fetch("/api/todos/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { error?: string };

    setIsLoading(false);

    if (!response.ok) {
      setError(data.error ?? "프로젝트를 만들지 못했습니다.");
      return;
    }

    form.reset();
    router.refresh();
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="name">프로젝트 이름</label>
        <input id="name" name="name" required minLength={2} maxLength={80} />
      </div>
      <div className="field">
        <label htmlFor="description">설명</label>
        <textarea className="textarea short" id="description" name="description" maxLength={500} />
      </div>
      {error ? <p className="error">{error}</p> : null}
      <button className="button primary" disabled={isLoading} type="submit">
        {isLoading ? "생성 중..." : "프로젝트 만들기"}
      </button>
    </form>
  );
}
