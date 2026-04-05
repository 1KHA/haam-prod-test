-- AlterTable
ALTER TABLE "EventRegistration" ADD COLUMN "notes" TEXT DEFAULT '';
ALTER TABLE "EventRegistration" ADD COLUMN "registeredBy" TEXT;

-- AlterTable
ALTER TABLE "Role" ADD COLUMN "roleEnum" TEXT;
