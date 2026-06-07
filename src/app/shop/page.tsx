import Link from "next/link";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { LogoutButton } from "@/components/logout-button";
import { readSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatCurrency } from "@/lib/shop";

export default async function ShopPage() {
  const session = await readSession();
  const products = await getDb().product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="page-shell">
      <div className="container">
        <nav className="nav">
          <Link className="brand" href="/">
            DevHub Shop
          </Link>
          <div className="nav-links">
            <Link className="button" href="/">
              홈
            </Link>
            {session ? (
              <>
                <Link className="button" href="/cart">
                  장바구니
                </Link>
                <Link className="button" href="/orders">
                  주문 내역
                </Link>
                <LogoutButton />
              </>
            ) : (
              <Link className="button primary" href="/login?next=/shop">
                로그인
              </Link>
            )}
          </div>
        </nav>

        <section className="stack">
          <div className="section-header compact">
            <div>
              <span className="eyebrow">4차 목표</span>
              <h1>상품 목록</h1>
              <p className="muted">상품 조회, 장바구니 담기, 주문 생성을 연습하는 미니 커머스입니다.</p>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="panel portal-empty">
              <strong>판매 중인 상품이 없습니다.</strong>
              <span>관리자 페이지에서 테스트 상품을 추가해주세요.</span>
            </div>
          ) : (
            <div className="product-grid">
              {products.map((product) => (
                <article className="product-card" key={product.id}>
                  <div className="product-thumb">{product.name.slice(0, 1)}</div>
                  <div className="stack">
                    <div>
                      <h2>{product.name}</h2>
                      <p className="muted">{product.description ?? "설명이 준비 중입니다."}</p>
                    </div>
                    <div className="product-meta">
                      <strong>{formatCurrency(product.price)}</strong>
                      <span className={product.stock > 0 ? "badge success-badge" : "badge muted-badge"}>
                        재고 {product.stock}
                      </span>
                    </div>
                    {session ? (
                      <AddToCartButton disabled={product.stock === 0} productId={product.id} />
                    ) : (
                      <Link className="button primary" href="/login?next=/shop">
                        로그인하고 담기
                      </Link>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
