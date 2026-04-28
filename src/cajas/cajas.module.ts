import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CajasService } from './cajas.service';
import { CajasController } from './cajas.controller';
import { Caja } from './entities/caja.entity';
import { SesionCaja } from './entities/sesion-caja.entity';
import { MovimientoCaja } from './entities/movimiento-caja.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Caja, SesionCaja, MovimientoCaja])],
  controllers: [CajasController],
  providers: [CajasService],
})
export class CajasModule {}
