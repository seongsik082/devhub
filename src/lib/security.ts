import type { AuditAction, Prisma } from "@prisma/client";
import { getDb } from "@/lib/db";

export const loginWindowMinutes = 15;
export const maxFailedLoginAttempts = 5;

export function getRequestMeta(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ipAddress =
    forwardedFor?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    null;
  const userAgent = request.headers.get("user-agent");

  return { ipAddress, userAgent };
}

export async function isLoginLocked(email: string, ipAddress: string | null) {
  const windowStart = new Date(Date.now() - loginWindowMinutes * 60 * 1000);
  const where = {
    success: false,
    createdAt: { gte: windowStart },
    OR: [{ email }, ...(ipAddress ? [{ ipAddress }] : [])],
  } satisfies Prisma.LoginAttemptWhereInput;

  const failedCount = await getDb().loginAttempt.count({ where });

  return failedCount >= maxFailedLoginAttempts;
}

export async function recordLoginAttempt(input: {
  email: string;
  ipAddress: string | null;
  success: boolean;
  reason?: string;
}) {
  await getDb().loginAttempt.create({
    data: {
      email: input.email,
      ipAddress: input.ipAddress,
      success: input.success,
      reason: input.reason ?? null,
    },
  });
}

export async function createAuditLog(input: {
  actorId: string;
  action: AuditAction;
  targetType: string;
  targetId?: string | null;
  summary: string;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  await getDb().auditLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId ?? null,
      summary: input.summary,
      metadata: input.metadata ?? undefined,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
    },
  });
}
