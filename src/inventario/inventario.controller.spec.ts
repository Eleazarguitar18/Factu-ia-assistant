import { Test, TestingModule } from '@nestjs/testing';
import { InventarioController } from './inventario.controller';
import { InventarioService } from './inventario.service';

describe('InventarioController', () => {
  let controller: InventarioController;

  const mockInventarioService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventarioController],
      providers: [
        {
          provide: InventarioService,
          useValue: mockInventarioService,
        },
      ],
    }).compile();

    controller = module.get<InventarioController>(InventarioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
