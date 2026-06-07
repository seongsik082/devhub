-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');

-- CreateTable
CREATE TABLE "TodoProject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TodoProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TodoTask" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TodoTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TodoProject_ownerId_idx" ON "TodoProject"("ownerId");

-- CreateIndex
CREATE INDEX "TodoProject_createdAt_idx" ON "TodoProject"("createdAt");

-- CreateIndex
CREATE INDEX "TodoTask_projectId_idx" ON "TodoTask"("projectId");

-- CreateIndex
CREATE INDEX "TodoTask_status_idx" ON "TodoTask"("status");

-- CreateIndex
CREATE INDEX "TodoTask_dueDate_idx" ON "TodoTask"("dueDate");

-- AddForeignKey
ALTER TABLE "TodoProject" ADD CONSTRAINT "TodoProject_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TodoTask" ADD CONSTRAINT "TodoTask_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "TodoProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
