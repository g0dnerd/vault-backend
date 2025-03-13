/*
  Warnings:

  - The primary key for the `Round` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Round` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Cube_id_key";

-- DropIndex
DROP INDEX "Draft_id_key";

-- DropIndex
DROP INDEX "DraftPlayer_id_key";

-- DropIndex
DROP INDEX "DraftScorecard_id_key";

-- DropIndex
DROP INDEX "Phase_id_key";

-- DropIndex
DROP INDEX "Round_draftId_roundIndex_key";

-- DropIndex
DROP INDEX "Round_id_key";

-- AlterTable
CREATE SEQUENCE cube_id_seq;
ALTER TABLE "Cube" ALTER COLUMN "id" SET DEFAULT nextval('cube_id_seq');
ALTER SEQUENCE cube_id_seq OWNED BY "Cube"."id";

-- AlterTable
CREATE SEQUENCE draft_id_seq;
ALTER TABLE "Draft" ALTER COLUMN "id" SET DEFAULT nextval('draft_id_seq');
ALTER SEQUENCE draft_id_seq OWNED BY "Draft"."id";

-- AlterTable
CREATE SEQUENCE draftplayer_id_seq;
ALTER TABLE "DraftPlayer" ALTER COLUMN "id" SET DEFAULT nextval('draftplayer_id_seq');
ALTER SEQUENCE draftplayer_id_seq OWNED BY "DraftPlayer"."id";

-- AlterTable
CREATE SEQUENCE draftscorecard_id_seq;
ALTER TABLE "DraftScorecard" ALTER COLUMN "id" SET DEFAULT nextval('draftscorecard_id_seq');
ALTER SEQUENCE draftscorecard_id_seq OWNED BY "DraftScorecard"."id";

-- AlterTable
CREATE SEQUENCE phase_id_seq;
ALTER TABLE "Phase" ALTER COLUMN "id" SET DEFAULT nextval('phase_id_seq');
ALTER SEQUENCE phase_id_seq OWNED BY "Phase"."id";

-- AlterTable
ALTER TABLE "Round" DROP CONSTRAINT "Round_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Round_pkey" PRIMARY KEY ("draftId", "roundIndex");
