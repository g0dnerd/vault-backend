import { Test, TestingModule } from '@nestjs/testing';
import { CubesService } from './cubes.service';

describe('CubesService', () => {
  let service: CubesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CubesService],
    }).compile();

    service = module.get<CubesService>(CubesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
