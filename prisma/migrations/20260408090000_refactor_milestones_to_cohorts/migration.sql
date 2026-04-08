PRAGMA foreign_keys=OFF;

CREATE TABLE "Milestone_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "progress" INTEGER NOT NULL,
    "priority" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "cohortId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Milestone_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "Cohort" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Milestone_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "MilestoneSubmission_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "milestoneId" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "submittedBy" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "submissionNumber" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MilestoneSubmission_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone_new" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MilestoneSubmission_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MilestoneSubmission_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "MilestoneSubmissionAttachment_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "submissionId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT,
    "fileSize" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MilestoneSubmissionAttachment_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "MilestoneSubmission_new" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "Milestone_new" (
    "id",
    "title",
    "description",
    "dueDate",
    "status",
    "progress",
    "priority",
    "category",
    "cohortId",
    "createdBy",
    "createdAt",
    "updatedAt"
)
SELECT
    m."id",
    m."title",
    m."description",
    m."dueDate",
    m."status",
    m."progress",
    m."priority",
    m."category",
    (
        SELECT cm."cohortId"
        FROM "CohortMember" cm
        WHERE cm."startupId" = m."startupId"
        ORDER BY cm."createdAt" DESC
        LIMIT 1
    ) AS "cohortId",
    m."createdBy",
    m."createdAt",
    m."updatedAt"
FROM "Milestone" m
WHERE EXISTS (
    SELECT 1
    FROM "CohortMember" cm
    WHERE cm."startupId" = m."startupId"
);

INSERT INTO "MilestoneSubmission_new" (
    "id",
    "milestoneId",
    "startupId",
    "submittedBy",
    "message",
    "status",
    "submissionNumber",
    "createdAt",
    "updatedAt"
)
SELECT
    mr."id",
    mr."milestoneId",
    m."startupId",
    mr."submittedBy",
    mr."message",
    'SUBMITTED',
    1,
    mr."createdAt",
    mr."updatedAt"
FROM "MilestoneResponse" mr
INNER JOIN "Milestone" m ON m."id" = mr."milestoneId"
WHERE EXISTS (
    SELECT 1
    FROM "Milestone_new" mn
    WHERE mn."id" = mr."milestoneId"
);

INSERT INTO "MilestoneSubmissionAttachment_new" (
    "id",
    "submissionId",
    "fileName",
    "fileUrl",
    "fileType",
    "fileSize",
    "createdAt",
    "updatedAt"
)
SELECT
    lower(hex(randomblob(16))),
    mr."id",
    mr."fileName",
    mr."fileUrl",
    mr."fileType",
    mr."fileSize",
    mr."createdAt",
    mr."updatedAt"
FROM "MilestoneResponse" mr
WHERE mr."fileUrl" IS NOT NULL
  AND EXISTS (
      SELECT 1
      FROM "MilestoneSubmission_new" msn
      WHERE msn."id" = mr."id"
  );

DROP TABLE "MilestoneResponse";
DROP TABLE "Milestone";

ALTER TABLE "Milestone_new" RENAME TO "Milestone";
ALTER TABLE "MilestoneSubmission_new" RENAME TO "MilestoneSubmission";
ALTER TABLE "MilestoneSubmissionAttachment_new" RENAME TO "MilestoneSubmissionAttachment";

CREATE INDEX "MilestoneSubmission_milestoneId_startupId_idx" ON "MilestoneSubmission"("milestoneId", "startupId");
CREATE UNIQUE INDEX "MilestoneSubmission_milestoneId_startupId_submissionNumber_key" ON "MilestoneSubmission"("milestoneId", "startupId", "submissionNumber");

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
