-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "publishDate" DATETIME,
    "scheduledTime" TEXT,
    "fileUrl" TEXT,
    "filePath" TEXT,
    "fileSize" INTEGER,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "printCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Report_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReportShare" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "sharedById" TEXT NOT NULL,
    "sharedWithId" TEXT NOT NULL,
    "message" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReportShare_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReportShare_sharedById_fkey" FOREIGN KEY ("sharedById") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReportShare_sharedWithId_fkey" FOREIGN KEY ("sharedWithId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ReportShare_reportId_idx" ON "ReportShare"("reportId");

-- CreateIndex
CREATE INDEX "ReportShare_sharedById_idx" ON "ReportShare"("sharedById");

-- CreateIndex
CREATE INDEX "ReportShare_sharedWithId_idx" ON "ReportShare"("sharedWithId");
