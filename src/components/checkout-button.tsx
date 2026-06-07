"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CheckoutButton() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function checkout() {
    setError("");
    setIsLoading(true);

    const response = await fetch("/api/shop/checkout", {
      method: "POST",
    });
    const data = (await response.json()) as { error?: string };

    setIsLoading(false);

    if (!response.ok) {
      setError(data.error ?? "주문을 생성하지 못했습니다.");
      return;
    }

    router.push("/orders");
    router.refresh();
  }

  return (
    <div className="stack">
      <button className="button primary" disabled={isLoading} onClick={checkout} type="button">
        {isLoading ? "주문 생성 중..." : "주문하기"}
      </button>
      {error ? <span className="error">{error}</span> : null}
    </div>
  );
}
