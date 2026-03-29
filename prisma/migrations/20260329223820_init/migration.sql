-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'DONE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TaskCategory" AS ENUM ('WORK', 'HOME', 'WRITING', 'PERSONAL');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "IdeaStatus" AS ENUM ('RAW', 'DEVELOPING', 'READY', 'PARKED');

-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('IDEA', 'OUTLINE', 'DRAFTING', 'EDITING', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "KBDomain" AS ENUM ('TECH', 'WORK', 'HOME', 'PERSONAL');

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'OPEN',
    "category" "TaskCategory" NOT NULL DEFAULT 'WORK',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "dueDate" TIMESTAMP(3),
    "tags" TEXT[],
    "articleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Idea" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "status" "IdeaStatus" NOT NULL DEFAULT 'RAW',
    "category" "TaskCategory" NOT NULL DEFAULT 'WORK',
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Idea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "ArticleStatus" NOT NULL DEFAULT 'IDEA',
    "platform" TEXT,
    "body" TEXT,
    "notes" TEXT,
    "dueDate" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "tags" TEXT[],
    "ideaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KBEntry" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "domain" "KBDomain" NOT NULL DEFAULT 'TECH',
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KBEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Article_ideaId_key" ON "Article"("ideaId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE SET NULL ON UPDATE CASCADE;
