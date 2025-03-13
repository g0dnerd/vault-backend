import { Test, TestingModule } from '@nestjs/testing';
import { CubesController } from './cubes.controller';
import { CubesService } from './cubes.service';

describe('CubesController', () => {
  let controller: CubesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CubesController],
      providers: [CubesService],
    }).compile();

    controller = module.get<CubesController>(CubesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
