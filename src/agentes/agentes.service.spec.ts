import { Test, TestingModule } from '@nestjs/testing';
import { AgentesService } from './agentes.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TransaccionAgente } from './entities/transaccion-agente.entity';

describe('AgentesService', () => {
  let service: AgentesService;

  const mockTransaccionAgenteRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentesService,
        {
          provide: getRepositoryToken(TransaccionAgente),
          useValue: mockTransaccionAgenteRepository,
        },
      ],
    }).compile();

    service = module.get<AgentesService>(AgentesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
