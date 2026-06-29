import { Test, TestingModule } from '@nestjs/testing';
import { ServiciosFijosService } from './servicios-fijos.service';

describe('ServiciosFijosService', () => {
  let service: ServiciosFijosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServiciosFijosService],
    }).compile();

    service = module.get<ServiciosFijosService>(ServiciosFijosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
