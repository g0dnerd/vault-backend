/*
  Warnings:

  - You are about to drop the column `result` on the `Match` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DraftPlayer" ADD COLUMN     "bye" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dropped" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hadBye" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "seat" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "result";
