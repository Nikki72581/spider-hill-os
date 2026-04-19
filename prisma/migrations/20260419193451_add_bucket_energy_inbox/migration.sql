-- CreateEnum
CREATE TYPE "TaskBucket" AS ENUM ('NOW', 'NEXT', 'LATER');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "bucket" "TaskBucket" NOT NULL DEFAULT 'LATER',
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "energy" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "minutes" INTEGER,
ADD COLUMN     "startedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "InboxItem" (
    "id" TEXT NOT NULL,
    "raw" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'text',
    "aiTitle" TEXT,
    "aiCategory" "TaskCategory",
    "aiBucket" "TaskBucket",
    "aiEnergy" INTEGER,
    "aiMinutes" INTEGER,
    "aiDueDate" TIMESTAMP(3),
    "aiReason" TEXT,
    "aiSimilarId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InboxItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FocusSession" (
    "id" TEXT NOT NULL,
    "taskId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "plannedMin" INTEGER NOT NULL DEFAULT 25,
    "actualMin" INTEGER,
    "distractions" INTEGER NOT NULL DEFAULT 0,
    "xpAwarded" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FocusSession_pkey" PRIMARY KEY ("id")
);
