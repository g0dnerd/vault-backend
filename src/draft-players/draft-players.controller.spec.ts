import { Test, TestingModule } from '@nestjs/testing';
import { DraftPlayersController } from './draft-players.controller';
import { DraftPlayersService } from './draft-players.service';

describe('DraftPlayersController', () => {
  let controller: DraftPlayersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DraftPlayersController],
      providers: [DraftPlayersService],
    }).compile();

    controller = module.get<DraftPlayersController>(DraftPlayersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
