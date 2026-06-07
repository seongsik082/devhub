import Link from "next/link";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { CartItemControls } from "@/components/cart-item-controls";
import { CheckoutButton } from "@/components/checkout-button";
import { LogoutButton } from "@/components/logout-button";
import { readSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatCurrency } from "@/lib/shop";

export default async function ShopPage() {
  const session = await readSession();
  const [products, cartItems] = await Promise.all([
    getDb().product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    }),
    session
      ? getDb().cartItem.findMany({
          where: { userId: session.id },
          include: { product: true },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
  ]);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main className="shop-page">
      <div className="shop-container">
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
                <Link className="button" href="/orders">
                  주문 내역
                </Link>
                {session.role === "ADMIN" ? (
                  <Link className="button" href="/admin">
                    관리자
                  </Link>
                ) : null}
                <LogoutButton />
              </>
            ) : (
              <Link className="button primary" href="/login?next=/shop">
                로그인
              </Link>
            )}
          </div>
        </nav>

        <section className="shop-hero">
          <div>
            <span className="eyebrow">4차 목표</span>
            <h1>실습용 미니 커머스</h1>
            <p>
              상품을 담으면 오른쪽 장바구니가 바로 갱신됩니다. 페이지 이동 없이 수량 변경,
              삭제, 주문 생성까지 한 번에 연습해보세요.
            </p>
          </div>
          <div className="shop-summary-card">
            <span>장바구니</span>
            <strong>{cartQuantity}개</strong>
            <span>{formatCurrency(cartTotal)}</span>
          </div>
        </section>

        <section className="shop-layout">
          <div className="shop-products stack">
            <div className="section-header compact">
              <div>
                <h2>상품</h2>
                <p className="muted">현재 판매 중인 테스트 상품입니다.</p>
              </div>
              <Link className="small-link" href="/orders">
                주문 내역
              </Link>
            </div>

            {products.length === 0 ? (
              <div className="panel portal-empty">
                <strong>판매 중인 상품이 없습니다.</strong>
                <span>관리자 페이지에서 테스트 상품을 추가해주세요.</span>
              </div>
            ) : (
              <div className="shop-product-list">
                {products.map((product) => (
                  <article className="shop-product-card" key={product.id}>
                    <div className="shop-product-thumb">{product.name.slice(0, 1)}</div>
                    <div className="shop-product-body">
                      <div>
                        <div className="shop-product-title">
                          <h3>{product.name}</h3>
                          <span
                            className={product.stock > 0 ? "badge success-badge" : "badge muted-badge"}
                          >
                            재고 {product.stock}
                          </span>
                        </div>
                        <p className="muted">{product.description ?? "설명이 준비 중입니다."}</p>
                      </div>
                      <div className="shop-product-bottom">
                        <strong>{formatCurrency(product.price)}</strong>
                        {session ? (
                          <AddToCartButton disabled={product.stock === 0} productId={product.id} />
                        ) : (
                          <Link className="button primary" href="/login?next=/shop">
                            로그인하고 담기
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <aside className="shop-cart-panel">
            <div className="shop-cart-header">
              <div>
                <span className="eyebrow">Cart</span>
                <h2>바로 장바구니</h2>
              </div>
              <strong>{formatCurrency(cartTotal)}</strong>
            </div>

            {!session ? (
              <div className="portal-empty">
                <strong>로그인이 필요합니다.</strong>
                <span>로그인하면 이 자리에서 장바구니를 수정할 수 있습니다.</span>
                <Link className="button primary" href="/login?next=/shop">
                  로그인
                </Link>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="shop-empty-cart">
                <strong>아직 담은 상품이 없습니다.</strong>
                <span>왼쪽 상품의 담기 버튼을 눌러보세요.</span>
              </div>
            ) : (
              <>
                <div className="shop-cart-list">
                  {cartItems.map((item) => (
                    <article className="shop-cart-item" key={item.id}>
                      <div>
                        <strong>{item.product.name}</strong>
                        <p className="meta">
                          {formatCurrency(item.product.price)} · 재고 {item.product.stock}개
                        </p>
                      </div>
                      <div className="summary-row">
                        <span>소계</span>
                        <strong>{formatCurrency(item.product.price * item.quantity)}</strong>
                      </div>
                      <CartItemControls itemId={item.id} quantity={item.quantity} />
                    </article>
                  ))}
                </div>

                <div className="shop-cart-total">
                  <span>총 {cartQuantity}개</span>
                  <strong>{formatCurrency(cartTotal)}</strong>
                </div>
                <CheckoutButton />
              </>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}
