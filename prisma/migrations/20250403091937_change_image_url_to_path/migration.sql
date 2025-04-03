/*
  Warnings:

  - You are about to drop the column `url` on the `Image` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[storagePath]` on the table `Image` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `storagePath` to the `Image` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Image_url_key";

-- AlterTable
ALTER TABLE "Image" DROP COLUMN "url",
ADD COLUMN     "storagePath" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Image_storagePath_key" ON "Image"("storagePath");
