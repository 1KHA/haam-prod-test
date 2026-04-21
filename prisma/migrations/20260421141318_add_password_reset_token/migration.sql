-- AlterTable
ALTER TABLE "User" ADD COLUMN "passwordResetExpiry" DATETIME;
ALTER TABLE "User" ADD COLUMN "passwordResetToken" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EmailScenarioSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scenarioType" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "templateId" TEXT,
    "sendToRoles" TEXT,
    "delayMinutes" INTEGER NOT NULL DEFAULT 0,
    "digestMode" TEXT NOT NULL DEFAULT 'immediate',
    "requireApproval" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EmailScenarioSettings_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "EmailTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_EmailScenarioSettings" ("createdAt", "delayMinutes", "digestMode", "id", "isEnabled", "requireApproval", "scenarioType", "sendToRoles", "templateId", "updatedAt") SELECT "createdAt", "delayMinutes", "digestMode", "id", "isEnabled", "requireApproval", "scenarioType", "sendToRoles", "templateId", "updatedAt" FROM "EmailScenarioSettings";
DROP TABLE "EmailScenarioSettings";
ALTER TABLE "new_EmailScenarioSettings" RENAME TO "EmailScenarioSettings";
CREATE UNIQUE INDEX "EmailScenarioSettings_scenarioType_key" ON "EmailScenarioSettings"("scenarioType");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
