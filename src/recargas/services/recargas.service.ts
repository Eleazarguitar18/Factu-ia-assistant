import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { OperadoraSaldo } from '../entities/operadora-saldo.entity';
import { RecargaCliente } from '../entities/recarga-cliente.entity';
import { InyeccionOperadora } from '../entities/inyeccion-operadora.entity';
import { CreateRecargaClienteDto } from '../dto/create-recarga-cliente.dto';
import { CreateInyeccionDto } from '../dto/create-inyeccion.dto';
import { SesionCaja } from 'src/cajas/entities/sesion-caja.entity';
import { MovimientoCaja } from 'src/cajas/entities/movimiento-caja.entity';
import { Caja } from 'src/cajas/entities/caja.entity';
import { AppGateway } from 'src/gateway/app.gateway';

@Injectable()
export class RecargasService {
  constructor(
    @InjectRepository(OperadoraSaldo)
    private readonly operadoraSaldoRepo: Repository<OperadoraSaldo>,
    @InjectRepository(RecargaCliente)
    private readonly recargaClienteRepo: Repository<RecargaCliente>,
    @InjectRepository(InyeccionOperadora)
    private readonly inyeccionRepo: Repository<InyeccionOperadora>,
    private readonly dataSource: DataSource,
    private readonly appGateway: AppGateway,
  ) {}

  async findAllSaldos() {
    return this.operadoraSaldoRepo.find({ where: { estado: true } });
  }

  async findAllRecargasClientes() {
    return this.recargaClienteRepo.find({
      where: { estado: true },
      relations: ['caja_sesion'],
      order: { fecha_hora: 'DESC' },
    });
  }

  async findAllInyecciones() {
    return this.inyeccionRepo.find({
      where: { estado: true },
      relations: ['caja_origen'],
      order: { fecha_hora: 'DESC' },
    });
  }

  async recargaCliente(dto: CreateRecargaClienteDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Validar Sesión Caja
      const sesion = await queryRunner.manager.findOne(SesionCaja, {
        where: {
          id: dto.id_caja_sesion,
          estado: true,
          estado_sesion: 'ABIERTA',
        },
        relations: ['caja'],
      });
      if (!sesion) {
        throw new BadRequestException(
          'La sesión de caja no existe o no está ABIERTA.',
        );
      }

      if (!sesion.caja) {
        throw new BadRequestException(
          'La sesión no tiene una caja física asociada.',
        );
      }

      // 2. Bloquear y obtener la Caja física para sumar el saldo de forma segura
      const cajaFisica = await queryRunner.manager
        .createQueryBuilder(Caja, 'c')
        .where('c.id = :id', { id: sesion.caja.id })
        .setLock('pessimistic_write', undefined, ['c'])
        .getOne();

      if (!cajaFisica) {
        throw new BadRequestException('No se pudo encontrar la caja física.');
      }

      // 3. Validar Saldo de Operadora
      const operadora = await queryRunner.manager.findOne(OperadoraSaldo, {
        where: { nombre_operadora: dto.operadora, estado: true },
        lock: { mode: 'pessimistic_write' },
      });

      if (!operadora) {
        throw new NotFoundException(
          `La operadora ${dto.operadora} no está registrada.`,
        );
      }

      if (Number(operadora.saldo_actual) < dto.monto) {
        throw new BadRequestException(
          `Saldo insuficiente para la operadora ${dto.operadora}. Saldo actual: ${operadora.saldo_actual}`,
        );
      }

      // 4. Reducir saldo de operadora y sumar saldo a caja física
      operadora.saldo_actual = Number(operadora.saldo_actual) - dto.monto;
      await queryRunner.manager.save(operadora);

      const saldoCajaActual = Number(cajaFisica.saldo ?? 0);
      cajaFisica.saldo = saldoCajaActual + Number(dto.monto);
      await queryRunner.manager.save(Caja, cajaFisica);

      // 5. Registrar RecargaCliente
      const recarga = this.recargaClienteRepo.create({
        operadora: dto.operadora,
        numero_cliente: dto.numero_cliente,
        monto: dto.monto,
        id_caja_sesion: dto.id_caja_sesion,
        id_user_create: sesion.id_usuario,
      });
      const savedRecarga = await queryRunner.manager.save(recarga);

      // 6. Crear Movimiento de Caja INGRESO
      const movimiento = new MovimientoCaja();
      movimiento.tipo = 'INGRESO';
      movimiento.monto = dto.monto;
      movimiento.motivo = `Venta de recarga a cliente ${dto.numero_cliente} (${dto.operadora})`;
      movimiento.id_sesion_caja = dto.id_caja_sesion;
      movimiento.id_user_create = sesion.id_usuario;
      await queryRunner.manager.save(movimiento);

      await queryRunner.commitTransaction();

      // 📡 7. Notificar en tiempo real que el saldo de la caja mutó (para actualizar la interfaz)
      if (this.appGateway) {
        this.appGateway.notifyDataChange('caja', 'saldo_actualizado');
      }

      return savedRecarga;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async inyeccionOperadora(dto: CreateInyeccionDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Validar Sesión Caja trayendo la relación de la caja física
      const sesion = await queryRunner.manager.findOne(SesionCaja, {
        where: {
          id: dto.id_caja_sesion,
          estado: true,
          estado_sesion: 'ABIERTA',
        },
        relations: ['caja'], // <-- Traemos la relación para saber qué caja física es
      });

      if (!sesion) {
        throw new BadRequestException(
          'La sesión de caja no existe o no está ABIERTA.',
        );
      }

      if (!sesion.caja) {
        throw new BadRequestException(
          'La sesión no tiene una caja física asociada.',
        );
      }

      // 2. Bloquear y obtener la Caja física para restar el saldo de forma segura
      const cajaFisica = await queryRunner.manager
        .createQueryBuilder(Caja, 'c')
        .where('c.id = :id', { id: sesion.caja.id })
        .setLock('pessimistic_write', undefined, ['c']) // Bloqueo estricto contra colisiones de dinero
        .getOne();

      if (!cajaFisica) {
        throw new BadRequestException('No se pudo encontrar la caja física.');
      }

      const saldoCajaActual = Number(cajaFisica.saldo ?? 0);
      const montoInyeccion = Number(dto.monto);

      // Validación defensiva: No puedes fondear saldo si no hay dinero físico real en la caja
      if (saldoCajaActual < montoInyeccion) {
        throw new BadRequestException(
          `Fondos insuficientes en el saldo de la caja para realizar el fondeo. Saldo disponible: Bs. ${saldoCajaActual}`,
        );
      }

      // 3. Obtener u Crear la Operadora destino
      let operadora = await queryRunner.manager.findOne(OperadoraSaldo, {
        where: { nombre_operadora: dto.operadora_destino, estado: true },
        lock: { mode: 'pessimistic_write' },
      });

      if (!operadora) {
        operadora = this.operadoraSaldoRepo.create({
          nombre_operadora: dto.operadora_destino,
          saldo_actual: 0,
        });
      }

      // 4. ACTUALIZACIÓN DE SALDOS (Resta de caja física, suma a saldo digital)
      cajaFisica.saldo = saldoCajaActual - montoInyeccion;
      await queryRunner.manager.save(Caja, cajaFisica); // Guardamos saldo físico de caja modificado

      operadora.saldo_actual = Number(operadora.saldo_actual) + montoInyeccion;
      await queryRunner.manager.save(operadora); // Guardamos saldo digital de operadora

      // 5. Registrar InyeccionOperadora
      const inyeccion = this.inyeccionRepo.create({
        operadora_destino: dto.operadora_destino,
        monto: dto.monto,
        id_caja_origen: dto.id_caja_sesion,
        id_user_create: sesion.id_usuario,
      });
      const savedInyeccion = await queryRunner.manager.save(inyeccion);

      // 6. Crear Movimiento de Caja EGRESO para auditoría
      const movimiento = new MovimientoCaja();
      movimiento.tipo = 'EGRESO';
      movimiento.monto = dto.monto;
      movimiento.motivo = `Fondeo de saldo a operadora ${dto.operadora_destino}`;
      movimiento.id_sesion_caja = dto.id_caja_sesion;
      movimiento.id_user_create = sesion.id_usuario;
      await queryRunner.manager.save(movimiento);

      // Si todo salió bien, consolidamos los cambios en la BD
      await queryRunner.commitTransaction();

      // 📡 7. Notificar en tiempo real que el saldo de la caja mutó (para actualizar el AppHeader de React)
      if (this.appGateway) {
        this.appGateway.notifyDataChange('caja', 'saldo_actualizado');
      }

      return savedInyeccion;
    } catch (err) {
      // Si algo falla, el dinero de la caja y de la operadora vuelven a sus estados iniciales intactos
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
