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

    const response = await fetch("/api/posts", {
      method: "POST",
      body: formData,
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

      <div className="field">
        <label htmlFor="attachments">첨부파일</label>
        <input
          accept="image/png,image/jpeg,image/webp,application/pdf,text/plain"
          id="attachments"
          multiple
          name="attachments"
          type="file"
        />
        <p className="meta">최대 3개, 파일당 1MB까지 첨부할 수 있습니다.</p>
      </div>

      {error ? <p className="error">{error}</p> : null}

      <button className="button primary" disabled={isLoading} type="submit">
        {isLoading ? "저장 중..." : "글 저장"}
      </button>
    </form>
  );
}
