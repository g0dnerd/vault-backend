/*
  Warnings:

  - The primary key for the `Round` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[draftId,roundIndex]` on the table `Round` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Round" DROP CONSTRAINT "Round_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Round_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Scorecard" ADD CONSTRAINT "Scorecard_pkey" PRIMARY KEY ("enrollmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Round_draftId_roundIndex_key" ON "Round"("draftId", "roundIndex");
