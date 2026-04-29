import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venta } from './entities/venta.entity';
import { DetalleVenta } from './entities/detalle-venta.entity';
import { CrearVentaDto } from './dto/crear-venta.dto';
import { ActualizarVentaDto } from './dto/actualizar-venta.dto';

@Injectable()
export class VentasService {
  constructor(
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
  ) {}

  async create(crearVentaDto: CrearVentaDto): Promise<Venta> {
    const { detalles, ...ventaData } = crearVentaDto;

    let total = 0;
    const detallesEntity = detalles.map((detalle) => {
      const subtotal = detalle.cantidad * detalle.precio_unitario;
      total += subtotal;
      return {
        ...detalle,
        subtotal,
        id_user_create: crearVentaDto.id_user_create,
      };
    });

    const venta = this.ventaRepository.create({
      ...ventaData,
      total,
      detalles: detallesEntity,
    });

    return this.ventaRepository.save(venta);
  }

  async findAll(): Promise<Venta[]> {
    return this.ventaRepository.find({
      where: { estado: true },
      relations: ['detalles'],
    });
  }

  async findOne(id: number): Promise<Venta> {
    const venta = await this.ventaRepository.findOne({
      where: { id, estado: true },
      relations: ['detalles'],
    });

    if (!venta) {
      throw new NotFoundException(
        `Venta con ID ${id} no encontrada o inactiva`,
      );
    }

    return venta;
  }

  async update(
    id: number,
    actualizarVentaDto: ActualizarVentaDto,
  ): Promise<Venta> {
    const { id_user_update, ...updateData } = actualizarVentaDto;
    const venta = await this.ventaRepository.preload({
      id,
      ...updateData,
    });

    if (!venta || !venta.estado) {
      throw new NotFoundException(
        `Venta con ID ${id} no encontrada o inactiva`,
      );
    }

    venta.id_user_update = id_user_update;

    return this.ventaRepository.save(venta);
  }

  async remove(id: number, id_user_update?: number): Promise<void> {
    const venta = await this.findOne(id);
    venta.estado = false;
    venta.id_user_update = id_user_update;
    await this.ventaRepository.save(venta);
  }
}
