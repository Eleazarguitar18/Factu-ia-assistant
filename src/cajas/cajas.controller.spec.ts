import { Test, TestingModule } from '@nestjs/testing';
import { CajasController } from './cajas.controller';
import { CajasService } from './cajas.service';

describe('CajasController', () => {
  let controller: CajasController;

  const mockCajasService = {
    findAllCajas: jest.fn(),
    findCaja: jest.fn(),
    abrirCaja: jest.fn(),
    cerrarCaja: jest.fn(),
    crearMovimiento: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CajasController],
      providers: [
        {
          provide: CajasService,
          useValue: mockCajasService,
        },
      ],
    }).compile();

    controller = module.get<CajasController>(CajasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
