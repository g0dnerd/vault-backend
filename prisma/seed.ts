import { ImageType, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const roundsOfHashing = 10;

async function main() {
  await prisma.match.deleteMany();

  const tournament1 = await prisma.tournament.upsert({
    where: { name: 'Test Tournament 1' },
    update: {
      playerCapacity: 32,
    },
    create: {
      name: 'Test Tournament 1',
      playerCapacity: 32,
      public: true,
    },
  });

  const tournament2 = await prisma.tournament.upsert({
    where: { name: 'Test Tournament 2' },
    update: {
      playerCapacity: 32,
      public: true,
    },
    create: {
      name: 'Test Tournament 2',
      playerCapacity: 32,
      public: true,
    },
  });

  const tournament3 = await prisma.tournament.upsert({
    where: { name: 'Test League' },
    update: {
      public: true,
    },
    create: {
      name: 'Test League',
      public: true,
      isLeague: true,
    },
  });

  const user1Password = await bcrypt.hash('foobar123', roundsOfHashing);
  const user1 = await prisma.user.upsert({
    where: { email: 'JnLkA@example.com' },
    update: {
      password: user1Password,
      username: 'paul',
    },
    create: {
      username: 'testuser1',
      email: 'JnLkA@example.com',
      password: user1Password,
    },
  });

  const user2Password = await bcrypt.hash('foobar321', roundsOfHashing);
  const user2 = await prisma.user.upsert({
    where: { email: 'I8O2h@example.com' },
    update: {
      password: user2Password,
    },
    create: {
      username: 'testuser2',
      email: 'I8O2h@example.com',
      password: user2Password,
    },
  });

  const user3Password = await bcrypt.hash('foobar321', roundsOfHashing);
  const user3 = await prisma.user.upsert({
    where: { email: 'A70tq@example.com' },
    update: {
      password: user3Password,
    },
    create: {
      username: 'testuser3',
      email: 'A70tq@example.com',
      password: user3Password,
    },
  });

  const user4Password = await bcrypt.hash('foobar321', roundsOfHashing);
  const user4 = await prisma.user.upsert({
    where: { email: '97uVx@example.com' },
    update: {
      password: user4Password,
    },
    create: {
      username: 'testuser4',
      email: '97uVx@example.com',
      password: user4Password,
    },
  });

  const user5Password = await bcrypt.hash('foobar123', roundsOfHashing);
  const user5 = await prisma.user.upsert({
    where: { email: 'testuser5@example.com' },
    update: {
      password: user5Password,
    },
    create: {
      username: 'testuser5',
      email: 'testuser5@example.com',
      password: user5Password,
    },
  });

  const user6Password = await bcrypt.hash('foobar321', roundsOfHashing);
  const user6 = await prisma.user.upsert({
    where: { email: 'testuser6@example.com' },
    update: {
      password: user6Password,
    },
    create: {
      username: 'testuser6',
      email: 'testuser6@example.com',
      password: user6Password,
    },
  });

  const user7Password = await bcrypt.hash('foobar321', roundsOfHashing);
  const user7 = await prisma.user.upsert({
    where: { email: 'testuser7@example.com' },
    update: {
      password: user7Password,
    },
    create: {
      username: 'testuser7',
      email: 'testuser7@example.com',
      password: user7Password,
    },
  });

  const user8Password = await bcrypt.hash('foobar321', roundsOfHashing);
  const user8 = await prisma.user.upsert({
    where: { email: 'testuser8@example.com' },
    update: {
      password: user8Password,
    },
    create: {
      username: 'testuser8',
      email: 'testuser8@example.com',
      password: user8Password,
    },
  });

  const adminUserPassword = await bcrypt.hash(
    'adminfoobar123',
    roundsOfHashing
  );
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@foo.bar' },
    update: {
      password: adminUserPassword,
      roles: ['ADMIN'],
    },
    create: {
      username: 'admin',
      roles: ['ADMIN'],
      email: 'admin@foo.bar',
      password: adminUserPassword,
    },
  });

  const enrollment1 = await prisma.enrollment.upsert({
    where: {
      playerTournament: {
        userId: user1.id,
        tournamentId: tournament1.id,
      },
    },
    update: {},
    create: {
      userId: user1.id,
      tournamentId: tournament1.id,
    },
  });

  const enrollment2 = await prisma.enrollment.upsert({
    where: {
      playerTournament: {
        userId: user2.id,
        tournamentId: tournament1.id,
      },
    },
    update: {},
    create: {
      userId: user2.id,
      tournamentId: tournament1.id,
    },
  });

  const enrollment3 = await prisma.enrollment.upsert({
    where: {
      playerTournament: {
        userId: user3.id,
        tournamentId: tournament1.id,
      },
    },
    update: {},
    create: {
      userId: user3.id,
      tournamentId: tournament1.id,
    },
  });

  const enrollment4 = await prisma.enrollment.upsert({
    where: {
      playerTournament: {
        userId: user4.id,
        tournamentId: tournament1.id,
      },
    },
    update: {},
    create: {
      userId: user4.id,
      tournamentId: tournament1.id,
    },
  });

  const enrollment5 = await prisma.enrollment.upsert({
    where: {
      playerTournament: {
        userId: user5.id,
        tournamentId: tournament1.id,
      },
    },
    update: {},
    create: {
      userId: user5.id,
      tournamentId: tournament1.id,
    },
  });
  const enrollment6 = await prisma.enrollment.upsert({
    where: {
      playerTournament: {
        userId: user6.id,
        tournamentId: tournament1.id,
      },
    },
    update: {},
    create: {
      userId: user6.id,
      tournamentId: tournament1.id,
    },
  });
  const enrollment7 = await prisma.enrollment.upsert({
    where: {
      playerTournament: {
        userId: user7.id,
        tournamentId: tournament1.id,
      },
    },
    update: {},
    create: {
      userId: user7.id,
      tournamentId: tournament1.id,
    },
  });
  const enrollment8 = await prisma.enrollment.upsert({
    where: {
      playerTournament: {
        userId: user8.id,
        tournamentId: tournament1.id,
      },
    },
    update: {},
    create: {
      userId: user8.id,
      tournamentId: tournament1.id,
    },
  });

  const enrollment9 = await prisma.enrollment.upsert({
    where: {
      playerTournament: {
        userId: user1.id,
        tournamentId: tournament3.id,
      },
    },
    update: {
      elo: 1500,
    },
    create: {
      userId: user1.id,
      tournamentId: tournament3.id,
      elo: 1500,
    },
  });

  const enrollment10 = await prisma.enrollment.upsert({
    where: {
      playerTournament: {
        userId: user2.id,
        tournamentId: tournament3.id,
      },
    },
    update: {
      elo: 1500,
    },
    create: {
      userId: user2.id,
      tournamentId: tournament3.id,
      elo: 1500,
    },
  });

  const enrollment11 = await prisma.enrollment.upsert({
    where: {
      playerTournament: {
        userId: user3.id,
        tournamentId: tournament3.id,
      },
    },
    update: { elo: 1500 },
    create: {
      userId: user3.id,
      tournamentId: tournament3.id,
      elo: 1500,
    },
  });

  const enrollment12 = await prisma.enrollment.upsert({
    where: {
      playerTournament: {
        userId: user4.id,
        tournamentId: tournament3.id,
      },
    },
    update: { elo: 1500 },
    create: {
      userId: user4.id,
      tournamentId: tournament3.id,
      elo: 1500,
    },
  });

  const enrollment13 = await prisma.enrollment.upsert({
    where: {
      playerTournament: {
        userId: user5.id,
        tournamentId: tournament3.id,
      },
    },
    update: { elo: 1500 },
    create: {
      userId: user5.id,
      tournamentId: tournament3.id,
      elo: 1500,
    },
  });

  const enrollment14 = await prisma.enrollment.upsert({
    where: {
      playerTournament: {
        userId: user6.id,
        tournamentId: tournament3.id,
      },
    },
    update: { elo: 1500 },
    create: {
      userId: user6.id,
      tournamentId: tournament3.id,
      elo: 1500,
    },
  });

  const enrollment15 = await prisma.enrollment.upsert({
    where: {
      playerTournament: {
        userId: user7.id,
        tournamentId: tournament3.id,
      },
    },
    update: { elo: 1500 },
    create: {
      userId: user7.id,
      tournamentId: tournament3.id,
      elo: 1500,
    },
  });

  const enrollment16 = await prisma.enrollment.upsert({
    where: {
      playerTournament: {
        userId: user8.id,
        tournamentId: tournament3.id,
      },
    },
    update: { elo: 1500 },
    create: {
      userId: user8.id,
      tournamentId: tournament3.id,
      elo: 1500,
    },
  });

  const phase1 = await prisma.phase.upsert({
    where: {
      tournamentPhase: {
        tournamentId: tournament1.id,
        phaseIndex: 1,
      },
    },
    update: { started: true },
    create: {
      tournamentId: tournament1.id,
      phaseIndex: 1,
    },
  });

  const phase2 = await prisma.phase.upsert({
    where: {
      tournamentPhase: {
        tournamentId: tournament3.id,
        phaseIndex: 1,
      },
    },
    update: { started: true },
    create: {
      tournamentId: tournament3.id,
      phaseIndex: 1,
    },
  });

  const cubeShivan = await prisma.cube.upsert({
    where: {
      name: 'Shivan',
    },
    update: {
      name: 'Shivan',
      description: 'Powered Vintage Cube',
      longDescription:
        "It's a Dragon alright! It's old, powerful and a little mean. This Cube started with the ambition to make Shivan Dragon and Old Man of the Sea playable cards. It turned into an (mostly) old bordered vintage cube, which hits a lot of the classic notes of the game. Fast mana and enablers are often broken but the payoffs are way worse than modern cards. Aggro, Midrange and Control are all viable strategies as well as some more synergistic themes like Madness, Reanimator, Enchantress, Artifacts or Stax for example. These themes span over multiple colors and are not restricted to certain color pairs (although some are more obvious). Fixing is amped up a little as Shock- and Fetchlands are included as well as ABU Duals and Painlands. Note that land destruction is also supported so build your manabases with care.",
      cardNumber: 450,
      creatorId: user1.id,
      url: 'https://cubecobra.com/cube/overview/shivan',
      imageUrl: 'cubes/shivan.jpg',
    },
    create: {
      name: 'Shivan',
      cardNumber: 450,
      description: 'Vintage Cube',
      longDescription:
        "It's a Dragon alright! It's old, powerful and a little mean. This Cube started with the ambition to make Shivan Dragon and Old Man of the Sea playable cards. It turned into an (mostly) old bordered vintage cube, which hits a lot of the classic notes of the game. Fast mana and enablers are often broken but the payoffs are way worse than modern cards. Aggro, Midrange and Control are all viable strategies as well as some more synergistic themes like Madness, Reanimator, Enchantress, Artifacts or Stax for example. These themes span over multiple colors and are not restricted to certain color pairs (although some are more obvious). Fixing is amped up a little as Shock- and Fetchlands are included as well as ABU Duals and Painlands. Note that land destruction is also supported so build your manabases with care.",
      creatorId: user1.id,
      url: 'https://cubecobra.com/cube/overview/shivan',
      imageUrl: 'cubes/shivan.jpg',
    },
  });

  const cubeMighty = await prisma.cube.upsert({
    where: {
      name: 'The Mighty Cube',
    },
    update: {
      name: 'The Mighty Cube',
      description: 'Dragon brr',
      longDescription:
        'A fully powered Vintage cube. Get ahead with fast mana, take the Initiative, or straight up combo kill your opponents. No holding back with this cube.',
      creatorId: user2.id,
      url: 'https://cubecobra.com/cube/overview/the_mighty_cube',
      imageUrl: 'cubes/mighty.jpg',
    },
    create: {
      name: 'The Mighty Cube',
      cardNumber: 360,
      description: 'Dragon brr',
      longDescription:
        'A fully powered Vintage cube. Get ahead with fast mana, take the Initiative, or straight up combo kill your opponents. No holding back with this cube.',
      creatorId: user2.id,
      url: 'https://cubecobra.com/cube/overview/the_mighty_cube',
      imageUrl: 'cubes/mighty.jpg',
    },
  });

  const draft1 = await prisma.draft.upsert({
    where: {
      phaseCube: {
        phaseId: phase1.id,
        cubeId: cubeShivan.id,
      },
    },
    update: {
      seated: false,
    },
    create: {
      started: true,
      phaseId: phase1.id,
      cubeId: cubeShivan.id,
    },
  });

  const leagueDraft = await prisma.draft.upsert({
    where: {
      phaseCube: {
        phaseId: phase2.id,
        cubeId: cubeShivan.id,
      },
    },
    update: {
      seated: false,
    },
    create: {
      phaseId: phase2.id,
      cubeId: cubeShivan.id,
      started: true,
    },
  });

  const draftPlayer1 = await prisma.draftPlayer.upsert({
    where: {
      draftEnrollment: {
        draftId: draft1.id,
        enrollmentId: enrollment1.id,
      },
    },
    update: {
      seat: null,
    },
    create: {
      draftId: draft1.id,
      enrollmentId: enrollment1.id,
    },
  });

  const draftPlayer2 = await prisma.draftPlayer.upsert({
    where: {
      draftEnrollment: {
        draftId: draft1.id,
        enrollmentId: enrollment2.id,
      },
    },
    update: {
      seat: null,
    },
    create: {
      draftId: draft1.id,
      enrollmentId: enrollment2.id,
    },
  });

  const draftPlayer3 = await prisma.draftPlayer.upsert({
    where: {
      draftEnrollment: {
        draftId: draft1.id,
        enrollmentId: enrollment3.id,
      },
    },
    update: {
      seat: null,
    },
    create: {
      draftId: draft1.id,
      enrollmentId: enrollment3.id,
    },
  });

  const draftPlayer4 = await prisma.draftPlayer.upsert({
    where: {
      draftEnrollment: {
        draftId: draft1.id,
        enrollmentId: enrollment4.id,
      },
    },
    update: {
      seat: null,
    },
    create: {
      draftId: draft1.id,
      enrollmentId: enrollment4.id,
    },
  });

  const draftPlayer5 = await prisma.draftPlayer.upsert({
    where: {
      draftEnrollment: {
        draftId: draft1.id,
        enrollmentId: enrollment5.id,
      },
    },
    update: {
      seat: null,
    },
    create: {
      draftId: draft1.id,
      enrollmentId: enrollment5.id,
    },
  });
  const draftPlayer6 = await prisma.draftPlayer.upsert({
    where: {
      draftEnrollment: {
        draftId: draft1.id,
        enrollmentId: enrollment6.id,
      },
    },
    update: {
      seat: null,
    },
    create: {
      draftId: draft1.id,
      enrollmentId: enrollment6.id,
    },
  });
  const draftPlayer7 = await prisma.draftPlayer.upsert({
    where: {
      draftEnrollment: {
        draftId: draft1.id,
        enrollmentId: enrollment7.id,
      },
    },
    update: {
      seat: null,
    },
    create: {
      draftId: draft1.id,
      enrollmentId: enrollment7.id,
    },
  });
  const draftPlayer8 = await prisma.draftPlayer.upsert({
    where: {
      draftEnrollment: {
        draftId: draft1.id,
        enrollmentId: enrollment8.id,
      },
    },
    update: {
      seat: null,
    },
    create: {
      draftId: draft1.id,
      enrollmentId: enrollment8.id,
    },
  });

  const draftPlayer9 = await prisma.draftPlayer.upsert({
    where: {
      draftEnrollment: {
        draftId: leagueDraft.id,
        enrollmentId: enrollment9.id,
      },
    },
    update: {
      bye: false,
      hadBye: false,
      seat: null,
    },
    create: {
      draftId: leagueDraft.id,
      enrollmentId: enrollment9.id,
    },
  });

  const draftPlayer10 = await prisma.draftPlayer.upsert({
    where: {
      draftEnrollment: {
        draftId: leagueDraft.id,
        enrollmentId: enrollment10.id,
      },
    },
    update: {
      bye: false,
      hadBye: false,
      seat: null,
    },
    create: {
      draftId: leagueDraft.id,
      enrollmentId: enrollment10.id,
    },
  });

  const draftPlayer11 = await prisma.draftPlayer.upsert({
    where: {
      draftEnrollment: {
        draftId: leagueDraft.id,
        enrollmentId: enrollment11.id,
      },
    },
    update: {
      bye: false,
      hadBye: false,
      seat: null,
    },
    create: {
      draftId: leagueDraft.id,
      enrollmentId: enrollment11.id,
    },
  });

  const draftPlayer12 = await prisma.draftPlayer.upsert({
    where: {
      draftEnrollment: {
        draftId: leagueDraft.id,
        enrollmentId: enrollment12.id,
      },
    },
    update: {
      bye: false,
      hadBye: false,
      seat: null,
    },
    create: {
      draftId: leagueDraft.id,
      enrollmentId: enrollment12.id,
    },
  });

  const draftPlayer13 = await prisma.draftPlayer.upsert({
    where: {
      draftEnrollment: {
        draftId: leagueDraft.id,
        enrollmentId: enrollment13.id,
      },
    },
    update: {
      bye: false,
      hadBye: false,
      seat: null,
    },
    create: {
      draftId: leagueDraft.id,
      enrollmentId: enrollment13.id,
    },
  });

  const draftPlayer14 = await prisma.draftPlayer.upsert({
    where: {
      draftEnrollment: {
        draftId: leagueDraft.id,
        enrollmentId: enrollment14.id,
      },
    },
    update: {
      bye: false,
      hadBye: false,
      seat: null,
    },
    create: {
      draftId: leagueDraft.id,
      enrollmentId: enrollment14.id,
    },
  });

  const draftPlayer15 = await prisma.draftPlayer.upsert({
    where: {
      draftEnrollment: {
        draftId: leagueDraft.id,
        enrollmentId: enrollment15.id,
      },
    },
    update: {
      bye: false,
      hadBye: false,
      seat: null,
    },
    create: {
      draftId: leagueDraft.id,
      enrollmentId: enrollment15.id,
    },
  });

  const draftPlayer16 = await prisma.draftPlayer.upsert({
    where: {
      draftEnrollment: {
        draftId: leagueDraft.id,
        enrollmentId: enrollment16.id,
      },
    },
    update: {
      bye: false,
      hadBye: false,
      seat: null,
    },
    create: {
      draftId: leagueDraft.id,
      enrollmentId: enrollment16.id,
    },
  });

  const round1 = await prisma.round.upsert({
    where: {
      draftRound: {
        draftId: draft1.id,
        roundIndex: 1,
      },
    },
    update: {
      started: false,
    },
    create: {
      draftId: draft1.id,
      started: false,
      roundIndex: 1,
    },
  });

  const round2 = await prisma.round.upsert({
    where: {
      draftRound: {
        draftId: draft1.id,
        roundIndex: 2,
      },
    },
    update: {
      started: false,
    },
    create: {
      draftId: draft1.id,
      started: false,
      roundIndex: 2,
    },
  });

  const round3 = await prisma.round.upsert({
    where: {
      draftRound: {
        draftId: draft1.id,
        roundIndex: 3,
      },
    },
    update: {
      started: false,
    },
    create: {
      draftId: draft1.id,
      started: false,
      roundIndex: 3,
    },
  });

  const leagueRound1 = await prisma.round.upsert({
    where: {
      draftRound: {
        draftId: leagueDraft.id,
        roundIndex: 1,
      },
    },
    update: {
      started: false,
    },
    create: {
      draftId: leagueDraft.id,
      started: false,
      roundIndex: 1,
    },
  });

  const leagueRound2 = await prisma.round.upsert({
    where: {
      draftRound: {
        draftId: leagueDraft.id,
        roundIndex: 2,
      },
    },
    update: {
      started: false,
    },
    create: {
      draftId: leagueDraft.id,
      started: false,
      roundIndex: 2,
    },
  });

  const leagueRound3 = await prisma.round.upsert({
    where: {
      draftRound: {
        draftId: leagueDraft.id,
        roundIndex: 3,
      },
    },
    update: {
      started: false,
    },
    create: {
      draftId: leagueDraft.id,
      started: false,
      roundIndex: 3,
    },
  });

  const image1 = await prisma.image.upsert({
    where: {
      url: 'foo.jpg',
    },
    update: {},
    create: {
      draftPlayerId: draftPlayer1.id,
      url: 'foo.jpg',
      imageType: ImageType.CHECKIN,
    },
  });

  console.log({ tournament1, tournament2, tournament3 });
  console.log({ phase1, phase2 });
  console.log({ cubeShivan, cubeMighty });
  console.log({ draft1, leagueDraft });
  console.log({
    round1,
    round2,
    round3,
    leagueRound1,
    leagueRound2,
    leagueRound3,
  });
  console.log({
    user1,
    user2,
    user3,
    user4,
    user5,
    user6,
    user7,
    user8,
    adminUser,
  });
  console.log({
    enrollment1,
    enrollment2,
    enrollment3,
    enrollment4,
    enrollment5,
    enrollment6,
    enrollment7,
    enrollment8,
    enrollment9,
    enrollment10,
    enrollment11,
    enrollment12,
    enrollment13,
    enrollment14,
    enrollment15,
    enrollment16,
  });
  console.log({
    draftPlayer1,
    draftPlayer2,
    draftPlayer3,
    draftPlayer4,
    draftPlayer5,
    draftPlayer6,
    draftPlayer7,
    draftPlayer8,
    draftPlayer9,
    draftPlayer10,
    draftPlayer11,
    draftPlayer12,
    draftPlayer13,
    draftPlayer14,
    draftPlayer15,
    draftPlayer16,
  });
  console.log({ image1 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
