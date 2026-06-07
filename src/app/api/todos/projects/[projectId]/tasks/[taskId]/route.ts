import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { taskStatusSchema } from "@/lib/validation";

type TaskRouteContext = {
  params: Promise<{ projectId: string; taskId: string }>;
};

async function getOwnedTask(projectId: string, taskId: string, ownerId: string) {
  return getDb().todoTask.findFirst({
    where: {
      id: taskId,
      projectId,
      project: { ownerId },
    },
    select: { id: true },
  });
}

export async function PATCH(request: Request, context: TaskRouteContext) {
  const session = await readSession();

  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { projectId, taskId } = await context.params;
  const task = await getOwnedTask(projectId, taskId, session.id);

  if (!task) {
    return NextResponse.json({ error: "할 일을 찾을 수 없습니다." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = taskStatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  await getDb().todoTask.update({
    where: { id: task.id },
    data: { status: parsed.data.status },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, context: TaskRouteContext) {
  const session = await readSession();

  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { projectId, taskId } = await context.params;
  const task = await getOwnedTask(projectId, taskId, session.id);

  if (!task) {
    return NextResponse.json({ error: "할 일을 찾을 수 없습니다." }, { status: 404 });
  }

  await getDb().todoTask.delete({
    where: { id: task.id },
  });

  return NextResponse.json({ ok: true });
}
