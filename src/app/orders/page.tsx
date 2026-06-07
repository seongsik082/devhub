import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { readSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { formatCurrency, orderStatusLabels } from "@/lib/shop";

export default async function OrdersPage() {
  const session = await readSession();

  if (!session) {
    redirect("/login?next=/orders");
  }

  const orders = await getDb().order.findMany({
    where: { userId: session.id },
    select: {
      id: true,
      status: true,
      totalAmount: true,
      createdAt: true,
      items: {
        select: {
          id: true,
          productName: true,
          quantity: true,
          subtotal: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="page-shell">
      <div className="container">
        <nav className="nav">
          <Link className="brand" href="/">
            주문 내역
          </Link>
          <div className="nav-links">
            <Link className="button" href="/shop">
              상품 목록
            </Link>
            <Link className="button" href="/cart">
              장바구니
            </Link>
            <LogoutButton />
          </div>
        </nav>

        <section className="stack">
          <div>
            <span className="eyebrow">Orders</span>
            <h1>내 주문</h1>
          </div>

          {orders.length === 0 ? (
            <div className="panel portal-empty">
              <strong>아직 주문이 없습니다.</strong>
              <Link className="button primary" href="/shop">
                첫 주문 만들기
              </Link>
            </div>
          ) : (
            <div className="stack">
              {orders.map((order) => (
                <article className="panel stack" key={order.id}>
                  <div className="section-header compact">
                    <div>
                      <strong>주문번호 {order.id.slice(-8)}</strong>
                      <p className="meta">{formatDateTime(order.createdAt)}</p>
                    </div>
                    <span className="badge">{orderStatusLabels[order.status]}</span>
                  </div>
                  <div className="order-items">
                    {order.items.map((item) => (
                      <div className="summary-row" key={item.id}>
                        <span>
                          {item.productName} x {item.quantity}
                        </span>
                        <strong>{formatCurrency(item.subtotal)}</strong>
                      </div>
                    ))}
                  </div>
                  <div className="summary-row total">
                    <span>합계</span>
                    <strong>{formatCurrency(order.totalAmount)}</strong>
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
