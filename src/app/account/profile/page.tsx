import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { ProfileForm } from "@/components/profile-form";
import { readSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

export default async function ProfilePage() {
  const session = await readSession();

  if (!session) {
    redirect("/login?next=/account/profile");
  }

  const user = await getDb().user.findUnique({
    where: { id: session.id },
    select: {
      name: true,
      email: true,
      bio: true,
      avatarUrl: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

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

        <section className="two-column">
          <div className="panel stack">
            <div className="profile-preview">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt={`${user.name} 프로필`} src={user.avatarUrl} />
              ) : (
                <div className="profile-avatar-fallback">{user.name.slice(0, 1)}</div>
              )}
              <div>
                <span className="eyebrow">Profile</span>
                <h1>{user.name}</h1>
                <p className="muted">{user.email}</p>
                <p>{user.bio || "아직 소개가 없습니다."}</p>
              </div>
            </div>
          </div>

          <section className="panel stack">
            <div>
              <h2>프로필 수정</h2>
              <p className="muted">게시글 작성자 정보와 대시보드에서 사용할 기본 프로필입니다.</p>
            </div>
            <ProfileForm user={user} />
          </section>
        </section>
      </div>
    </main>
  );
}
