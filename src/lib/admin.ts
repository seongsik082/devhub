import { readSession } from "@/lib/auth";

export async function readAdminSession() {
  const session = await readSession();

  if (!session || session.role !== "ADMIN") {
    return null;
  }

  return session;
}
