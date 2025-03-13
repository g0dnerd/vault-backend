-- CreateTable
CREATE TABLE "Tournament" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "public" BOOLEAN NOT NULL DEFAULT false,
    "playerCapacity" INTEGER NOT NULL,
    "description" TEXT,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "password" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "tournamentId" INTEGER NOT NULL,
    "enrolledOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DraftPlayer" (
    "id" INTEGER NOT NULL,
    "draftId" INTEGER NOT NULL,
    "enrollmentId" INTEGER NOT NULL,

    CONSTRAINT "DraftPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" SERIAL NOT NULL,
    "player1Id" INTEGER NOT NULL,
    "player2Id" INTEGER NOT NULL,
    "tableNumber" INTEGER NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Result" (
    "matchId" INTEGER NOT NULL,
    "player1Wins" INTEGER NOT NULL,
    "player2Wins" INTEGER NOT NULL,
    "result" INTEGER NOT NULL,
    "reportedById" INTEGER,
    "confirmed" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Scorecard" (
    "enrollmentId" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "gamesPlayed" INTEGER NOT NULL,
    "gamesWon" INTEGER NOT NULL,
    "pmw" DOUBLE PRECISION NOT NULL,
    "omw" DOUBLE PRECISION NOT NULL,
    "pgw" DOUBLE PRECISION NOT NULL,
    "ogw" DOUBLE PRECISION NOT NULL
);

-- CreateTable
CREATE TABLE "DraftScorecard" (
    "id" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "gamesPlayed" INTEGER NOT NULL,
    "gamesWon" INTEGER NOT NULL,
    "pmw" DOUBLE PRECISION NOT NULL,
    "omw" DOUBLE PRECISION NOT NULL,
    "pgw" DOUBLE PRECISION NOT NULL,
    "ogw" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "DraftScorecard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase" (
    "id" INTEGER NOT NULL,
    "tournamentId" INTEGER NOT NULL,
    "phaseIndex" INTEGER NOT NULL,
    "roundAmount" INTEGER NOT NULL DEFAULT 3,
    "started" BOOLEAN NOT NULL DEFAULT false,
    "finished" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Phase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cube" (
    "id" INTEGER NOT NULL,
    "creatorId" INTEGER,
    "cardNumber" INTEGER NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,

    CONSTRAINT "Cube_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Draft" (
    "id" INTEGER NOT NULL,
    "phaseId" INTEGER NOT NULL,
    "cubeId" INTEGER NOT NULL,
    "tableFirst" INTEGER DEFAULT 0,
    "tableLast" INTEGER DEFAULT 0,
    "started" BOOLEAN NOT NULL DEFAULT false,
    "finished" BOOLEAN NOT NULL DEFAULT false,
    "seated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Draft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Round" (
    "id" INTEGER NOT NULL,
    "draftId" INTEGER NOT NULL,
    "roundIndex" INTEGER NOT NULL,
    "paired" BOOLEAN NOT NULL DEFAULT false,
    "started" BOOLEAN NOT NULL DEFAULT false,
    "finished" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Round_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tournament_name_key" ON "Tournament"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_playerId_tournamentId_key" ON "Enrollment"("playerId", "tournamentId");

-- CreateIndex
CREATE UNIQUE INDEX "DraftPlayer_id_key" ON "DraftPlayer"("id");

-- CreateIndex
CREATE UNIQUE INDEX "DraftPlayer_draftId_enrollmentId_key" ON "DraftPlayer"("draftId", "enrollmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Result_matchId_key" ON "Result"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "Scorecard_enrollmentId_key" ON "Scorecard"("enrollmentId");

-- CreateIndex
CREATE UNIQUE INDEX "DraftScorecard_id_key" ON "DraftScorecard"("id");

-- CreateIndex
CREATE UNIQUE INDEX "DraftScorecard_playerId_key" ON "DraftScorecard"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "Phase_id_key" ON "Phase"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase_tournamentId_phaseIndex_key" ON "Phase"("tournamentId", "phaseIndex");

-- CreateIndex
CREATE UNIQUE INDEX "Cube_id_key" ON "Cube"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Cube_url_key" ON "Cube"("url");

-- CreateIndex
CREATE UNIQUE INDEX "Draft_id_key" ON "Draft"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Draft_phaseId_cubeId_key" ON "Draft"("phaseId", "cubeId");

-- CreateIndex
CREATE UNIQUE INDEX "Round_id_key" ON "Round"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Round_draftId_roundIndex_key" ON "Round"("draftId", "roundIndex");

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DraftPlayer" ADD CONSTRAINT "DraftPlayer_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "Draft"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DraftPlayer" ADD CONSTRAINT "DraftPlayer_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_player1Id_fkey" FOREIGN KEY ("player1Id") REFERENCES "DraftPlayer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_player2Id_fkey" FOREIGN KEY ("player2Id") REFERENCES "DraftPlayer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "DraftPlayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scorecard" ADD CONSTRAINT "Scorecard_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DraftScorecard" ADD CONSTRAINT "DraftScorecard_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "DraftPlayer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase" ADD CONSTRAINT "Phase_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cube" ADD CONSTRAINT "Cube_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Draft" ADD CONSTRAINT "Draft_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "Phase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Draft" ADD CONSTRAINT "Draft_cubeId_fkey" FOREIGN KEY ("cubeId") REFERENCES "Cube"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "Draft"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
