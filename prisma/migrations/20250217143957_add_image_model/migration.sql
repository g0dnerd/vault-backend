-- CreateEnum
CREATE TYPE "ImageType" AS ENUM ('CHECKIN', 'CHECKOUT');

-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "draftPlayerId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "imageType" "ImageType" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_draftPlayerId_fkey" FOREIGN KEY ("draftPlayerId") REFERENCES "DraftPlayer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
