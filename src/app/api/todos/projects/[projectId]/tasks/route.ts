import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { parseOptionalDate } from "@/lib/todo";
import { todoTaskSchema } from "@/lib/validation";

type TaskCreateContext = {
  params: Promise<{ projectId: string }>;
};

export async function POST(request: Request, context: TaskCreateContext) {
  const session = await readSession();

  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { projectId } = await context.params;
  const project = await getDb().todoProject.findFirst({
    where: { id: projectId, ownerId: session.id },
    select: { id: true },
  });

  if (!project) {
    return NextResponse.json({ error: "프로젝트를 찾을 수 없습니다." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = todoTaskSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const task = await getDb().todoTask.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      dueDate: parseOptionalDate(parsed.data.dueDate),
      projectId,
    },
    select: { id: true },
  });

  return NextResponse.json({ task }, { status: 201 });
}
