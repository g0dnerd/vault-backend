/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Cube` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Cube` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cube" ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Cube_name_key" ON "Cube"("name");
