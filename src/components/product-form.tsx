"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function ProductForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function createProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: formData.get("name"),
      description: formData.get("description"),
      price: formData.get("price"),
      stock: formData.get("stock"),
      isActive: formData.get("isActive") === "on",
    };

    const response = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { error?: string };

    setIsLoading(false);

    if (!response.ok) {
      setError(data.error ?? "상품을 생성하지 못했습니다.");
      return;
    }

    form.reset();
    router.refresh();
  }

  return (
    <form className="form admin-product-form" onSubmit={createProduct}>
      <div className="field">
        <label htmlFor="product-name">상품명</label>
        <input id="product-name" name="name" placeholder="예: 백엔드 실습 노트" required />
      </div>
      <div className="field">
        <label htmlFor="product-description">설명</label>
        <textarea
          className="textarea short"
          id="product-description"
          name="description"
          placeholder="상품 설명을 입력하세요."
        />
      </div>
      <div className="admin-form-grid">
        <div className="field">
          <label htmlFor="product-price">가격</label>
          <input id="product-price" min={100} name="price" required type="number" />
        </div>
        <div className="field">
          <label htmlFor="product-stock">재고</label>
          <input id="product-stock" min={0} name="stock" required type="number" />
        </div>
      </div>
      <label className="check-field">
        <input defaultChecked name="isActive" type="checkbox" />
        판매중
      </label>
      <button className="button primary" disabled={isLoading} type="submit">
        {isLoading ? "생성 중..." : "상품 추가"}
      </button>
      {error ? <span className="error">{error}</span> : null}
    </form>
  );
}
