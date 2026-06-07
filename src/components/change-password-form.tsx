"use client";

import { FormEvent, useState } from "react";

export function ChangePasswordForm() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    if (payload.newPassword !== payload.confirmPassword) {
      setIsLoading(false);
      setError("새 비밀번호가 서로 일치하지 않습니다.");
      return;
    }

    const response = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { error?: string };

    setIsLoading(false);

    if (!response.ok) {
      setError(data.error ?? "비밀번호를 변경하지 못했습니다.");
      return;
    }

    form.reset();
    setSuccess("비밀번호가 변경되었습니다. 다음 로그인부터 새 비밀번호를 사용하세요.");
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="currentPassword">현재 비밀번호</label>
        <input
          id="currentPassword"
          name="currentPassword"
          required
          type="password"
          autoComplete="current-password"
        />
      </div>

      <div className="field">
        <label htmlFor="newPassword">새 비밀번호</label>
        <input
          id="newPassword"
          name="newPassword"
          minLength={8}
          required
          type="password"
          autoComplete="new-password"
        />
      </div>

      <div className="field">
        <label htmlFor="confirmPassword">새 비밀번호 확인</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          minLength={8}
          required
          type="password"
          autoComplete="new-password"
        />
      </div>

      {error ? <p className="error">{error}</p> : null}
      {success ? <p className="success">{success}</p> : null}

      <button className="button primary" disabled={isLoading} type="submit">
        {isLoading ? "변경 중..." : "비밀번호 변경"}
      </button>
    </form>
  );
}
