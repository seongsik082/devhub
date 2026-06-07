"use client";

import type { Role } from "@prisma/client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type AdminUserActionsProps = {
  currentAdminId: string;
  user: {
    id: string;
    role: Role;
  };
};

export function AdminUserActions({ currentAdminId, user }: AdminUserActionsProps) {
  const router = useRouter();
  const [roleError, setRoleError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isRoleLoading, setIsRoleLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const isSelf = currentAdminId === user.id;

  async function updateRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRoleError("");
    setIsRoleLoading(true);

    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch(`/api/admin/users/${user.id}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { error?: string };

    setIsRoleLoading(false);

    if (!response.ok) {
      setRoleError(data.error ?? "권한을 변경하지 못했습니다.");
      return;
    }

    router.refresh();
  }

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    setIsPasswordLoading(true);

    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());

    if (payload.newPassword !== payload.confirmPassword) {
      setIsPasswordLoading(false);
      setPasswordError("새 비밀번호가 서로 일치하지 않습니다.");
      return;
    }

    const response = await fetch(`/api/admin/users/${user.id}/password`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { error?: string };

    setIsPasswordLoading(false);

    if (!response.ok) {
      setPasswordError(data.error ?? "비밀번호를 변경하지 못했습니다.");
      return;
    }

    form.reset();
    setPasswordSuccess("비밀번호가 변경되었습니다.");
  }

  return (
    <div className="admin-actions">
      <form className="admin-inline-form" onSubmit={updateRole}>
        <select defaultValue={user.role} disabled={isSelf || isRoleLoading} name="role">
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <button className="button" disabled={isSelf || isRoleLoading} type="submit">
          {isRoleLoading ? "변경 중..." : "권한 변경"}
        </button>
        {isSelf ? <span className="meta">본인 권한 변경 불가</span> : null}
        {roleError ? <span className="error">{roleError}</span> : null}
      </form>

      <form className="admin-password-form" onSubmit={updatePassword}>
        <input
          autoComplete="new-password"
          minLength={8}
          name="newPassword"
          placeholder="새 비밀번호"
          required
          type="password"
        />
        <input
          autoComplete="new-password"
          minLength={8}
          name="confirmPassword"
          placeholder="새 비밀번호 확인"
          required
          type="password"
        />
        <button className="button primary" disabled={isPasswordLoading} type="submit">
          {isPasswordLoading ? "변경 중..." : "비밀번호 변경"}
        </button>
        {passwordError ? <span className="error">{passwordError}</span> : null}
        {passwordSuccess ? <span className="success">{passwordSuccess}</span> : null}
      </form>
    </div>
  );
}
