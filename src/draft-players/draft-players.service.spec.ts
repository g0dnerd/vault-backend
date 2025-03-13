import { Test, TestingModule } from '@nestjs/testing';
import { DraftPlayersService } from './draft-players.service';

describe('DraftPlayersService', () => {
  let service: DraftPlayersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DraftPlayersService],
    }).compile();

    service = module.get<DraftPlayersService>(DraftPlayersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
