"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type CartItemControlsProps = {
  itemId: string;
  quantity: number;
};

export function CartItemControls({ itemId, quantity }: CartItemControlsProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function updateQuantity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch(`/api/shop/cart/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { error?: string };

    setIsLoading(false);

    if (!response.ok) {
      setError(data.error ?? "수량을 변경하지 못했습니다.");
      return;
    }

    router.refresh();
  }

  async function deleteItem() {
    setError("");
    setIsLoading(true);

    const response = await fetch(`/api/shop/cart/${itemId}`, {
      method: "DELETE",
    });
    const data = (await response.json()) as { error?: string };

    setIsLoading(false);

    if (!response.ok) {
      setError(data.error ?? "상품을 삭제하지 못했습니다.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="cart-controls">
      <form className="admin-inline-form" onSubmit={updateQuantity}>
        <input defaultValue={quantity} min={1} name="quantity" type="number" />
        <button className="button" disabled={isLoading} type="submit">
          변경
        </button>
      </form>
      <button className="button danger" disabled={isLoading} onClick={deleteItem} type="button">
        삭제
      </button>
      {error ? <span className="error">{error}</span> : null}
    </div>
  );
}
