import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiciosFijosService } from './servicios-fijos.service';
import { ServiciosFijosController } from './servicios-fijos.controller';
import { ServicioFijo } from './entities/servicios-fijo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServicioFijo])],
  controllers: [ServiciosFijosController],
  providers: [ServiciosFijosService],
  exports: [ServiciosFijosService], // Exportamos para que Facturas o WhatsApp puedan buscar cuentas
})
export class ServiciosFijosModule {}
