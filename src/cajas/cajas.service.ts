import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Caja } from './entities/caja.entity';
import { SesionCaja } from './entities/sesion-caja.entity';
import { MovimientoCaja } from './entities/movimiento-caja.entity';
import { AbrirCajaDto } from './dto/abrir-caja.dto';
import { CerrarCajaDto } from './dto/cerrar-caja.dto';
import { CrearMovimientoDto } from './dto/crear-movimiento.dto';

@Injectable()
export class CajasService {
  constructor(
    @InjectRepository(Caja)
    private readonly cajaRepository: Repository<Caja>,
    @InjectRepository(SesionCaja)
    private readonly sesionCajaRepository: Repository<SesionCaja>,
    @InjectRepository(MovimientoCaja)
    private readonly movimientoCajaRepository: Repository<MovimientoCaja>,
  ) {}

  async findAllCajas(): Promise<Caja[]> {
    return this.cajaRepository.find();
  }

  async findCaja(id: number): Promise<Caja> {
    const caja = await this.cajaRepository.findOne({ where: { id }, relations: ['sesiones'] });
    if (!caja) throw new NotFoundException(`Caja con ID ${id} no encontrada`);
    return caja;
  }

  async abrirCaja(abrirCajaDto: AbrirCajaDto): Promise<SesionCaja> {
    const { cajaId, monto_inicial, usuarioId } = abrirCajaDto;
    
    const caja = await this.cajaRepository.findOneBy({ id: cajaId });
    if (!caja) throw new NotFoundException(`Caja con id ${cajaId} no encontrada`);

    const sesionAbierta = await this.sesionCajaRepository.findOne({
      where: { caja: { id: cajaId }, estado: 'ABIERTA' }
    });

    if (sesionAbierta) {
      throw new BadRequestException(`La caja ya tiene una sesión abierta`);
    }

    const sesion = this.sesionCajaRepository.create({
      caja,
      monto_inicial,
      usuario_id: usuarioId,
      estado: 'ABIERTA',
    });

    return this.sesionCajaRepository.save(sesion);
  }

  async cerrarCaja(idSesion: number, cerrarCajaDto: CerrarCajaDto): Promise<SesionCaja> {
    const sesion = await this.sesionCajaRepository.findOneBy({ id: idSesion });
    if (!sesion) throw new NotFoundException(`Sesión con ID ${idSesion} no encontrada`);
    if (sesion.estado === 'CERRADA') throw new BadRequestException(`La sesión ya está cerrada`);

    const movimientos = await this.movimientoCajaRepository.find({ where: { sesion_caja_id: idSesion } });
    
    let totalIngresos = 0;
    let totalEgresos = 0;
    
    for (const mov of movimientos) {
      if (mov.tipo === 'INGRESO') totalIngresos += Number(mov.monto);
      else if (mov.tipo === 'EGRESO') totalEgresos += Number(mov.monto);
    }

    const monto_final_teorico = Number(sesion.monto_inicial) + totalIngresos - totalEgresos;
    const { monto_final_real } = cerrarCajaDto;
    const diferencia = monto_final_real - monto_final_teorico;

    sesion.monto_final_teorico = monto_final_teorico;
    sesion.monto_final_real = monto_final_real;
    sesion.diferencia = diferencia;
    sesion.estado = 'CERRADA';
    sesion.fecha_cierre = new Date();

    return this.sesionCajaRepository.save(sesion);
  }

  async crearMovimiento(crearMovimientoDto: CrearMovimientoDto): Promise<MovimientoCaja> {
    const { sesion_caja_id, monto, tipo, motivo } = crearMovimientoDto;

    const sesion = await this.sesionCajaRepository.findOneBy({ id: sesion_caja_id });
    if (!sesion) throw new NotFoundException(`Sesión de caja con ID ${sesion_caja_id} no encontrada`);
    if (sesion.estado !== 'ABIERTA') throw new BadRequestException(`No se pueden registrar movimientos en una sesión cerrada`);

    const movimiento = this.movimientoCajaRepository.create({
      sesion_caja_id,
      monto,
      tipo,
      motivo,
    });

    return this.movimientoCajaRepository.save(movimiento);
  }
}
