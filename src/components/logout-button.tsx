"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function logout() {
    setIsLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button className="button" disabled={isLoading} onClick={logout} type="button">
      {isLoading ? "로그아웃 중..." : "로그아웃"}
    </button>
  );
}
