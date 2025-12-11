-- CreateTable
CREATE TABLE "Funding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "startupName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "fundingType" TEXT NOT NULL,
    "investorName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    CONSTRAINT "Funding_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FundingOpportunity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "fundingType" TEXT NOT NULL,
    "amount" INTEGER,
    "minAmount" INTEGER,
    "maxAmount" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'SAR',
    "deadline" DATETIME,
    "requirements" TEXT,
    "applicationLink" TEXT,
    "contactEmail" TEXT,
    "sectors" TEXT,
    "entrepreneurId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FundingOpportunity_entrepreneurId_fkey" FOREIGN KEY ("entrepreneurId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
