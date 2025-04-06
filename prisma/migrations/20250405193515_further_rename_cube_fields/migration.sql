/*
  Warnings:

  - Made the column `longDescription` on table `Cube` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Cube" ALTER COLUMN "cardNumber" DROP NOT NULL,
ALTER COLUMN "longDescription" SET NOT NULL;
