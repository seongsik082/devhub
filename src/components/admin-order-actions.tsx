"use client";

import type { OrderStatus } from "@prisma/client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { orderStatusLabels } from "@/lib/shop";

type AdminOrderActionsProps = {
  orderId: string;
  status: OrderStatus;
};

export function AdminOrderActions({ orderId, status }: AdminOrderActionsProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function updateStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { error?: string };

    setIsLoading(false);

    if (!response.ok) {
      setError(data.error ?? "주문 상태를 변경하지 못했습니다.");
      return;
    }

    router.refresh();
  }

  return (
    <form className="admin-inline-form" onSubmit={updateStatus}>
      <select defaultValue={status} name="status">
        {Object.entries(orderStatusLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <button className="button" disabled={isLoading} type="submit">
        {isLoading ? "변경 중..." : "상태 변경"}
      </button>
      {error ? <span className="error">{error}</span> : null}
    </form>
  );
}
