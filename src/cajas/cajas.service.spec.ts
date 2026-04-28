import { Test, TestingModule } from '@nestjs/testing';
import { CajasService } from './cajas.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Caja } from './entities/caja.entity';
import { SesionCaja } from './entities/sesion-caja.entity';
import { MovimientoCaja } from './entities/movimiento-caja.entity';

describe('CajasService', () => {
  let service: CajasService;

  const mockCajaRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
  };

  const mockSesionCajaRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
  };

  const mockMovimientoCajaRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CajasService,
        {
          provide: getRepositoryToken(Caja),
          useValue: mockCajaRepository,
        },
        {
          provide: getRepositoryToken(SesionCaja),
          useValue: mockSesionCajaRepository,
        },
        {
          provide: getRepositoryToken(MovimientoCaja),
          useValue: mockMovimientoCajaRepository,
        },
      ],
    }).compile();

    service = module.get<CajasService>(CajasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
