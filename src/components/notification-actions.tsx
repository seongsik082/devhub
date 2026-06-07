"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type NotificationActionsProps = {
  notificationId?: string;
  mode: "single" | "all";
};

export function NotificationActions({ notificationId, mode }: NotificationActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function markRead() {
    setIsLoading(true);
    setError("");

    const response = await fetch(
      mode === "all" ? "/api/notifications/read-all" : `/api/notifications/${notificationId}/read`,
      { method: "PATCH" },
    );
    const data = (await response.json().catch(() => ({}))) as { error?: string };

    setIsLoading(false);

    if (!response.ok) {
      setError(data.error ?? "알림을 처리하지 못했습니다.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="notification-action">
      <button className="button" disabled={isLoading} onClick={markRead} type="button">
        {isLoading ? "처리 중..." : mode === "all" ? "모두 읽음" : "읽음"}
      </button>
      {error ? <span className="error">{error}</span> : null}
    </div>
  );
}
