/*
  Warnings:

  - You are about to drop the column `leagueId` on the `Draft` table. All the data in the column will be lost.
  - You are about to drop the `League` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Draft" DROP CONSTRAINT "Draft_leagueId_fkey";

-- AlterTable
ALTER TABLE "Draft" DROP COLUMN "leagueId";

-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "isLeague" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "League";
