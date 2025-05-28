-- AlterTable
ALTER TABLE "Profile" ADD COLUMN "position" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "specialization" TEXT;

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "avatar" TEXT,
    "department" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TeamMember_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Startup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "problem" TEXT NOT NULL,
    "solution" TEXT NOT NULL,
    "targetMarket" TEXT,
    "businessModel" TEXT,
    "competitiveAdvantage" TEXT,
    "teamSize" INTEGER NOT NULL DEFAULT 1,
    "fundingNeeds" TEXT,
    "pitchDeckUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "creatorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Startup_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "inviterId" TEXT NOT NULL,
    "inviteeEmail" TEXT NOT NULL,
    "startupId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "respondedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Invitation_inviteeEmail_fkey" FOREIGN KEY ("inviteeEmail") REFERENCES "User" ("email") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Invitation_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompanyMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Member',
    "status" TEXT NOT NULL DEFAULT 'INVITED',
    "invitationId" TEXT,
    "joinedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CompanyMember_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CompanyMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CompanyMember_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CohortMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cohortId" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "joinDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CohortMember_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "Cohort" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CohortMember_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CohortMember" ("cohortId", "createdAt", "id", "joinDate", "startupId", "status", "updatedAt") SELECT "cohortId", "createdAt", "id", "joinDate", "startupId", "status", "updatedAt" FROM "CohortMember";
DROP TABLE "CohortMember";
ALTER TABLE "new_CohortMember" RENAME TO "CohortMember";
CREATE UNIQUE INDEX "CohortMember_cohortId_startupId_key" ON "CohortMember"("cohortId", "startupId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "CompanyMember_invitationId_key" ON "CompanyMember"("invitationId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyMember_startupId_userId_key" ON "CompanyMember"("startupId", "userId");
