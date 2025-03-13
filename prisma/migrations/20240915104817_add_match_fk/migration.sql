/*
  Warnings:

  - A unique constraint covering the columns `[roundId,player1Id,player2Id]` on the table `Match` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "roundId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Match_roundId_player1Id_player2Id_key" ON "Match"("roundId", "player1Id", "player2Id");

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE SET NULL ON UPDATE CASCADE;
