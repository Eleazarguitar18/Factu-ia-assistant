import { Test, TestingModule } from '@nestjs/testing';
import { AgentesController } from './agentes.controller';
import { AgentesService } from './agentes.service';

describe('AgentesController', () => {
  let controller: AgentesController;

  const mockAgentesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgentesController],
      providers: [
        {
          provide: AgentesService,
          useValue: mockAgentesService,
        },
      ],
    }).compile();

    controller = module.get<AgentesController>(AgentesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
