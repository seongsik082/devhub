"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function PostForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    const response = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as { error?: string; post?: { id: string } };
    setIsLoading(false);

    if (!response.ok || !data.post) {
      setError(data.error ?? "글을 저장하지 못했습니다.");
      return;
    }

    router.push(`/posts/${data.post.id}`);
    router.refresh();
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="title">제목</label>
        <input id="title" name="title" maxLength={120} minLength={2} required />
      </div>

      <div className="field">
        <label htmlFor="content">본문</label>
        <textarea
          className="textarea"
          id="content"
          name="content"
          maxLength={8000}
          minLength={10}
          required
        />
      </div>

      {error ? <p className="error">{error}</p> : null}

      <button className="button primary" disabled={isLoading} type="submit">
        {isLoading ? "저장 중..." : "글 저장"}
      </button>
    </form>
  );
}
