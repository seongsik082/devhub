"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type ProfileFormProps = {
  user: {
    name: string;
    bio: string | null;
    avatarUrl: string | null;
  };
};

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function updateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { error?: string };

    setIsLoading(false);

    if (!response.ok) {
      setError(data.error ?? "프로필을 수정하지 못했습니다.");
      return;
    }

    setSuccess("프로필이 수정되었습니다.");
    router.refresh();
  }

  return (
    <form className="form" onSubmit={updateProfile}>
      <div className="field">
        <label htmlFor="name">이름</label>
        <input defaultValue={user.name} id="name" maxLength={40} minLength={2} name="name" required />
      </div>

      <div className="field">
        <label htmlFor="avatarUrl">프로필 이미지 URL</label>
        <input
          defaultValue={user.avatarUrl ?? ""}
          id="avatarUrl"
          name="avatarUrl"
          placeholder="https://..."
          type="url"
        />
      </div>

      <div className="field">
        <label htmlFor="bio">소개</label>
        <textarea
          className="textarea short"
          defaultValue={user.bio ?? ""}
          id="bio"
          maxLength={300}
          name="bio"
          placeholder="어떤 백엔드 개발자가 되고 싶은지 적어보세요."
        />
      </div>

      {error ? <p className="error">{error}</p> : null}
      {success ? <p className="success">{success}</p> : null}

      <button className="button primary" disabled={isLoading} type="submit">
        {isLoading ? "저장 중..." : "프로필 저장"}
      </button>
    </form>
  );
}
