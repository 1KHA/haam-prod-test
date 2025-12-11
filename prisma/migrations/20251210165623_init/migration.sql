/*
  Warnings:

  - You are about to drop the `Hackathon` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Judge` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `JudgeProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Prize` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Team` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TimelineEvent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Hackathon";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Judge";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "JudgeProfile";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Prize";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Team";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TimelineEvent";
PRAGMA foreign_keys=on;
