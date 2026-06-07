"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type AdminProductActionsProps = {
  product: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    stock: number;
    isActive: boolean;
  };
};

export function AdminProductActions({ product }: AdminProductActionsProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function updateProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: formData.get("name"),
      description: formData.get("description"),
      price: formData.get("price"),
      stock: formData.get("stock"),
      isActive: formData.get("isActive") === "on",
    };

    const response = await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { error?: string };

    setIsLoading(false);

    if (!response.ok) {
      setError(data.error ?? "상품을 수정하지 못했습니다.");
      return;
    }

    router.refresh();
  }

  return (
    <form className="admin-product-edit" onSubmit={updateProduct}>
      <input defaultValue={product.name} name="name" required />
      <input defaultValue={product.description ?? ""} name="description" placeholder="설명" />
      <input defaultValue={product.price} min={100} name="price" required type="number" />
      <input defaultValue={product.stock} min={0} name="stock" required type="number" />
      <label className="check-field compact">
        <input defaultChecked={product.isActive} name="isActive" type="checkbox" />
        판매
      </label>
      <button className="button" disabled={isLoading} type="submit">
        {isLoading ? "저장 중..." : "저장"}
      </button>
      {error ? <span className="error">{error}</span> : null}
    </form>
  );
}
