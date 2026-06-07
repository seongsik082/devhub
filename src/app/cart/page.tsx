import Link from "next/link";
import { redirect } from "next/navigation";
import { CartItemControls } from "@/components/cart-item-controls";
import { CheckoutButton } from "@/components/checkout-button";
import { LogoutButton } from "@/components/logout-button";
import { readSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatCurrency } from "@/lib/shop";

export default async function CartPage() {
  const session = await readSession();

  if (!session) {
    redirect("/login?next=/cart");
  }

  const items = await getDb().cartItem.findMany({
    where: { userId: session.id },
    select: {
      id: true,
      quantity: true,
      product: {
        select: {
          name: true,
          price: true,
          stock: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <main className="page-shell">
      <div className="container">
        <nav className="nav">
          <Link className="brand" href="/">
            장바구니
          </Link>
          <div className="nav-links">
            <Link className="button" href="/shop">
              쇼핑 계속하기
            </Link>
            <Link className="button" href="/orders">
              주문 내역
            </Link>
            <LogoutButton />
          </div>
        </nav>

        <section className="stack">
          <div>
            <span className="eyebrow">Cart</span>
            <h1>담은 상품</h1>
          </div>

          {items.length === 0 ? (
            <div className="panel portal-empty">
              <strong>장바구니가 비어 있습니다.</strong>
              <Link className="button primary" href="/shop">
                상품 보러가기
              </Link>
            </div>
          ) : (
            <div className="two-column">
              <section className="panel stack">
                {items.map((item) => (
                  <article className="cart-row" key={item.id}>
                    <div>
                      <strong>{item.product.name}</strong>
                      <p className="muted">{formatCurrency(item.product.price)} / 개</p>
                      <p className="meta">구매 가능 재고 {item.product.stock}개</p>
                    </div>
                    <div className="cart-price">
                      {formatCurrency(item.product.price * item.quantity)}
                    </div>
                    <CartItemControls itemId={item.id} quantity={item.quantity} />
                  </article>
                ))}
              </section>

              <aside className="panel stack">
                <div>
                  <span className="eyebrow">Summary</span>
                  <h2>주문 요약</h2>
                </div>
                <div className="summary-row">
                  <span>상품 수</span>
                  <strong>{items.length}개</strong>
                </div>
                <div className="summary-row total">
                  <span>총 결제 예정</span>
                  <strong>{formatCurrency(total)}</strong>
                </div>
                <CheckoutButton />
              </aside>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
