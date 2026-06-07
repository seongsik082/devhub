"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type AuthFormProps = {
  mode: "login" | "register";
  redirectTo?: string;
};

export function AuthForm({ mode, redirectTo = "/dashboard" }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isRegister = mode === "register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    if (isRegister && payload.password !== payload.confirmPassword) {
      setIsLoading(false);
      setError("비밀번호가 서로 일치하지 않습니다.");
      return;
    }

    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as { error?: string };

    setIsLoading(false);

    if (!response.ok) {
      setError(data.error ?? "요청을 처리하지 못했습니다.");
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      {isRegister ? (
        <div className="field">
          <label htmlFor="name">이름</label>
          <input id="name" name="name" minLength={2} required autoComplete="name" />
        </div>
      ) : null}

      <div className="field">
        <label htmlFor="email">이메일</label>
        <input id="email" name="email" type="email" required autoComplete="email" />
      </div>

      <div className="field">
        <label htmlFor="password">비밀번호</label>
        <input
          id="password"
          name="password"
          type="password"
          minLength={isRegister ? 8 : 1}
          required
          autoComplete={isRegister ? "new-password" : "current-password"}
        />
      </div>

      {isRegister ? (
        <div className="field">
          <label htmlFor="confirmPassword">비밀번호 확인</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            minLength={8}
            required
            autoComplete="new-password"
          />
        </div>
      ) : null}

      {error ? <p className="error">{error}</p> : null}

      <button className="button primary" disabled={isLoading} type="submit">
        {isLoading ? "처리 중..." : isRegister ? "계정 만들기" : "로그인"}
      </button>
    </form>
  );
}
