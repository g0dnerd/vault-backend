-- AlterTable
ALTER TABLE "DraftPlayer" ADD COLUMN     "checkedIn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "checkedOut" BOOLEAN NOT NULL DEFAULT false;
