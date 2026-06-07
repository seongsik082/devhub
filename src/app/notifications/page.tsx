import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { NotificationActions } from "@/components/notification-actions";
import { readSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDateTime } from "@/lib/format";

const notificationTypeLabels = {
  COMMENT: "댓글",
  ORDER: "주문",
  SECURITY: "보안",
  SYSTEM: "시스템",
};

export default async function NotificationsPage() {
  const session = await readSession();

  if (!session) {
    redirect("/login?next=/notifications");
  }

  const [notifications, unreadCount] = await Promise.all([
    getDb().notification.findMany({
      where: { userId: session.id },
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        link: true,
        readAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    getDb().notification.count({
      where: { userId: session.id, readAt: null },
    }),
  ]);

  return (
    <main className="page-shell">
      <div className="container">
        <nav className="nav">
          <Link className="brand" href="/">
            DevHub
          </Link>
          <div className="nav-links">
            <Link className="button" href="/">
              홈
            </Link>
            <Link className="button" href="/dashboard">
              대시보드
            </Link>
            <LogoutButton />
          </div>
        </nav>

        <section className="stack">
          <div className="section-header">
            <div>
              <span className="eyebrow">Notifications</span>
              <h1>알림</h1>
              <p className="muted">댓글, 주문, 보안 이벤트를 확인합니다.</p>
            </div>
            {unreadCount > 0 ? <NotificationActions mode="all" /> : null}
          </div>

          <div className="panel stack">
            <strong>읽지 않은 알림 {unreadCount}개</strong>
            {notifications.length === 0 ? (
              <div className="portal-empty">아직 알림이 없습니다.</div>
            ) : (
              <div className="notification-list">
                {notifications.map((notification) => (
                  <article
                    className={`notification-card ${notification.readAt ? "" : "unread"}`}
                    key={notification.id}
                  >
                    <div>
                      <span className="badge">{notificationTypeLabels[notification.type]}</span>
                      <h2>{notification.title}</h2>
                      <p className="muted">{notification.message}</p>
                      <p className="meta">
                        {formatDateTime(notification.createdAt)}
                        {notification.readAt ? ` · 읽음 ${formatDateTime(notification.readAt)}` : ""}
                      </p>
                    </div>
                    <div className="inline-actions">
                      {notification.link ? (
                        <Link className="button primary" href={notification.link}>
                          이동
                        </Link>
                      ) : null}
                      {!notification.readAt ? (
                        <NotificationActions mode="single" notificationId={notification.id} />
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
