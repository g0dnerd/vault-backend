/*
  Warnings:

  - You are about to drop the `Result` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Result" DROP CONSTRAINT "Result_matchId_fkey";

-- DropForeignKey
ALTER TABLE "Result" DROP CONSTRAINT "Result_reportedById_fkey";

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "player1Wins" INTEGER,
ADD COLUMN     "player2Wins" INTEGER,
ADD COLUMN     "reportedById" INTEGER,
ADD COLUMN     "result" INTEGER,
ADD COLUMN     "resultConfirmed" BOOLEAN;

-- DropTable
DROP TABLE "Result";

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "DraftPlayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
