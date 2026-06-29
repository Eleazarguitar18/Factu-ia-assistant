import { Test, TestingModule } from '@nestjs/testing';
import { ServiciosFijosController } from './servicios-fijos.controller';
import { ServiciosFijosService } from './servicios-fijos.service';

describe('ServiciosFijosController', () => {
  let controller: ServiciosFijosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiciosFijosController],
      providers: [ServiciosFijosService],
    }).compile();

    controller = module.get<ServiciosFijosController>(ServiciosFijosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
