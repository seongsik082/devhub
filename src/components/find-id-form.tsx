"use client";

import { FormEvent, useState } from "react";

type FoundAccount = {
  email: string;
  createdAt: string;
};

export function FindIdForm() {
  const [error, setError] = useState("");
  const [accounts, setAccounts] = useState<FoundAccount[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setAccounts(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    const response = await fetch("/api/auth/find-id", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { error?: string; accounts?: FoundAccount[] };

    setIsLoading(false);

    if (!response.ok) {
      setError(data.error ?? "아이디를 찾지 못했습니다.");
      return;
    }

    setAccounts(data.accounts ?? []);
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="name">가입 이름</label>
        <input id="name" name="name" minLength={2} required autoComplete="name" />
      </div>

      {error ? <p className="error">{error}</p> : null}

      <button className="button primary" disabled={isLoading} type="submit">
        {isLoading ? "찾는 중..." : "아이디 찾기"}
      </button>

      {accounts ? (
        <div className="panel-soft stack">
          {accounts.length === 0 ? (
            <span className="muted">일치하는 계정을 찾지 못했습니다.</span>
          ) : (
            accounts.map((account) => (
              <div className="account-result" key={`${account.email}-${account.createdAt}`}>
                <strong>{account.email}</strong>
                <span className="meta">
                  가입일 {new Date(account.createdAt).toLocaleDateString("ko-KR")}
                </span>
              </div>
            ))
          )}
        </div>
      ) : null}
    </form>
  );
}
