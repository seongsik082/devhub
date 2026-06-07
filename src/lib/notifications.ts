import type { NotificationType, PrismaClient } from "@prisma/client";
import { getDb } from "@/lib/db";

type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
};

type NotificationDb = PrismaClient | Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$use" | "$extends">;

export async function createNotification(
  input: CreateNotificationInput,
  db: NotificationDb = getDb(),
) {
  return db.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      link: input.link ?? null,
    },
  });
}
