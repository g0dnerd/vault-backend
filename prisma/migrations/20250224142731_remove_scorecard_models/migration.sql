/*
  Warnings:

  - You are about to drop the `DraftScorecard` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Scorecard` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DraftScorecard" DROP CONSTRAINT "DraftScorecard_playerId_fkey";

-- DropForeignKey
ALTER TABLE "Scorecard" DROP CONSTRAINT "Scorecard_enrollmentId_fkey";

-- DropTable
DROP TABLE "DraftScorecard";

-- DropTable
DROP TABLE "Scorecard";
