import { Test, TestingModule } from '@nestjs/testing';
import { VentasService } from './ventas.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Venta } from './entities/venta.entity';

describe('VentasService', () => {
  let service: VentasService;

  const mockVentaRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    preload: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VentasService,
        {
          provide: getRepositoryToken(Venta),
          useValue: mockVentaRepository,
        },
      ],
    }).compile();

    service = module.get<VentasService>(VentasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
