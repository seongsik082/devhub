"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type CommentFormProps = {
  postId: string;
};

export function CommentForm({ postId }: CommentFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    const response = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as { error?: string };
    setIsLoading(false);

    if (!response.ok) {
      setError(data.error ?? "댓글을 저장하지 못했습니다.");
      return;
    }

    form.reset();
    router.refresh();
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="content">댓글</label>
        <textarea
          className="textarea short"
          id="content"
          name="content"
          maxLength={1000}
          minLength={2}
          required
        />
      </div>

      {error ? <p className="error">{error}</p> : null}

      <button className="button primary" disabled={isLoading} type="submit">
        {isLoading ? "저장 중..." : "댓글 작성"}
      </button>
    </form>
  );
}
