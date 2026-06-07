"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type AddToCartButtonProps = {
  productId: string;
  disabled?: boolean;
};

export function AddToCartButton({ productId, disabled = false }: AddToCartButtonProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function addToCart(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsLoading(true);

    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch("/api/shop/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { error?: string };

    setIsLoading(false);

    if (!response.ok) {
      setError(data.error ?? "장바구니에 담지 못했습니다.");
      return;
    }

    setMessage("장바구니에 담았습니다.");
    router.refresh();
  }

  return (
    <form className="cart-add-form" onSubmit={addToCart}>
      <input name="productId" type="hidden" value={productId} />
      <input defaultValue={1} min={1} name="quantity" type="number" />
      <button className="button primary" disabled={disabled || isLoading} type="submit">
        {isLoading ? "담는 중..." : "담기"}
      </button>
      {message ? <span className="success">{message}</span> : null}
      {error ? <span className="error">{error}</span> : null}
    </form>
  );
}
