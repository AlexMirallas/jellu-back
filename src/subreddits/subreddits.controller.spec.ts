import { Test, TestingModule } from '@nestjs/testing';
import { SubredditsController } from './subreddits.controller';

describe('SubredditsController', () => {
  let controller: SubredditsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubredditsController],
    }).compile();

    controller = module.get<SubredditsController>(SubredditsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
