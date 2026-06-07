import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminOrderActions } from "@/components/admin-order-actions";
import { AdminProductActions } from "@/components/admin-product-actions";
import { AdminUserActions } from "@/components/admin-user-actions";
import { LogoutButton } from "@/components/logout-button";
import { ProductForm } from "@/components/product-form";
import { WeatherCard } from "@/components/weather-card";
import { readSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { formatCurrency, orderStatusLabels } from "@/lib/shop";
import { getSeoulWeather } from "@/lib/weather";

export default async function AdminPage() {
  const session = await readSession();

  if (!session) {
    redirect("/login?next=/admin");
  }

  if (session.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [
    userCount,
    postCount,
    commentCount,
    todoProjectCount,
    todoTaskCount,
    productCount,
    orderCount,
    attachmentCount,
    revenue,
    users,
    products,
    orders,
    attachments,
    weather,
  ] = await Promise.all([
    getDb().user.count(),
    getDb().post.count(),
    getDb().comment.count(),
    getDb().todoProject.count(),
    getDb().todoTask.count(),
    getDb().product.count(),
    getDb().order.count(),
    getDb().postAttachment.count(),
    getDb().order.aggregate({
      where: { status: { not: "CANCELLED" } },
      _sum: { totalAmount: true },
    }),
    getDb().user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            todoProjects: true,
            orders: true,
          },
        },
      },
      take: 30,
    }),
    getDb().product.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    getDb().order.findMany({
      include: {
        user: { select: { name: true, email: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    getDb().postAttachment.findMany({
      include: {
        post: {
          select: {
            id: true,
            title: true,
            author: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    getSeoulWeather(),
  ]);

  return (
    <main className="page-shell">
      <div className="container admin-container">
        <nav className="nav">
          <div>
            <div className="brand">DevHub Admin</div>
            <p className="muted">사용자, 상품, 주문을 운영하는 관리자 페이지입니다.</p>
          </div>
          <div className="nav-links">
            <Link className="button" href="/">
              홈
            </Link>
            <Link className="button" href="/shop">
              쇼핑
            </Link>
            <Link className="button" href="/dashboard">
              대시보드
            </Link>
            <LogoutButton />
          </div>
        </nav>

        <section className="stack">
          <div>
            <span className="eyebrow">Admin</span>
            <h1>관리자 페이지</h1>
            <p className="muted">
              회원 권한, 비밀번호 변경, 상품 재고, 주문 상태를 한 곳에서 관리합니다.
            </p>
          </div>

          <div className="dashboard-grid admin-metrics">
            <div className="panel stack">
              <strong>사용자</strong>
              <span className="metric">{userCount}</span>
            </div>
            <div className="panel stack">
              <strong>게시글 / 댓글</strong>
              <span className="metric">
                {postCount} / {commentCount}
              </span>
            </div>
            <div className="panel stack">
              <strong>프로젝트 / 할 일</strong>
              <span className="metric">
                {todoProjectCount} / {todoTaskCount}
              </span>
            </div>
            <div className="panel stack">
              <strong>상품 / 주문 / 첨부</strong>
              <span className="metric">
                {productCount} / {orderCount} / {attachmentCount}
              </span>
            </div>
            <div className="panel stack">
              <strong>누적 매출</strong>
              <span className="metric compact-metric">
                {formatCurrency(revenue._sum.totalAmount ?? 0)}
              </span>
            </div>
          </div>

          <WeatherCard weather={weather} />

          <section className="panel stack">
            <div className="section-header compact">
              <div>
                <h2>첨부파일 관리</h2>
                <p className="muted">최근 게시글에 업로드된 파일을 확인합니다.</p>
              </div>
            </div>

            {attachments.length === 0 ? (
              <div className="portal-empty">아직 첨부파일이 없습니다.</div>
            ) : (
              <div className="attachment-admin-list">
                {attachments.map((attachment) => (
                  <Link
                    className="attachment-admin-row"
                    href={`/posts/${attachment.post.id}`}
                    key={attachment.id}
                  >
                    <span>
                      <strong>{attachment.fileName}</strong>
                      <span className="meta">
                        {attachment.post.title} · {attachment.post.author.name}
                      </span>
                    </span>
                    <span className="badge">{Math.ceil(attachment.size / 1024)}KB</span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="panel stack">
            <div className="section-header compact">
              <div>
                <h2>상품 관리</h2>
                <p className="muted">상품을 만들고 가격, 재고, 판매 여부를 수정합니다.</p>
              </div>
            </div>

            <ProductForm />

            <div className="admin-product-list">
              {products.map((product) => (
                <article className="admin-product-card" key={product.id}>
                  <div>
                    <strong>{product.name}</strong>
                    <p className="meta">
                      {formatCurrency(product.price)} · 재고 {product.stock} ·{" "}
                      {product.isActive ? "판매중" : "숨김"}
                    </p>
                  </div>
                  <AdminProductActions product={product} />
                </article>
              ))}
            </div>
          </section>

          <section className="panel stack">
            <div className="section-header compact">
              <div>
                <h2>주문 관리</h2>
                <p className="muted">최근 주문의 상태를 결제 완료, 배송 중, 취소로 변경합니다.</p>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="portal-empty">아직 주문이 없습니다.</div>
            ) : (
              <div className="admin-order-list">
                {orders.map((order) => (
                  <article className="admin-order-card" key={order.id}>
                    <div className="section-header compact">
                      <div>
                        <strong>주문 {order.id.slice(-8)}</strong>
                        <p className="meta">
                          {order.user.name} · {order.user.email} · {formatDateTime(order.createdAt)}
                        </p>
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
                    <AdminOrderActions orderId={order.id} status={order.status} />
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="panel stack">
            <div className="section-header compact">
              <div>
                <h2>사용자 관리</h2>
                <p className="muted">
                  권한 변경과 비밀번호 변경을 처리합니다. 본인 권한은 보호됩니다.
                </p>
              </div>
            </div>

            <div className="admin-table">
              <div className="admin-row admin-head">
                <span>이름</span>
                <span>이메일</span>
                <span>권한</span>
                <span>활동</span>
                <span>관리</span>
              </div>
              {users.map((user) => (
                <div className="admin-row" key={user.id}>
                  <span>
                    {user.name}
                    <span className="meta">가입 {formatDateTime(user.createdAt)}</span>
                  </span>
                  <span>{user.email}</span>
                  <span>{user.role}</span>
                  <span>
                    글 {user._count.posts} · 댓글 {user._count.comments} · 프로젝트{" "}
                    {user._count.todoProjects} · 주문 {user._count.orders}
                  </span>
                  <AdminUserActions
                    currentAdminId={session.id}
                    user={{ id: user.id, role: user.role }}
                  />
                </div>
              ))}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
