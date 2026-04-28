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
      };
    });

    const venta = this.ventaRepository.create({
      ...ventaData,
      total,
      detalles: detallesEntity,
    });

    return this.ventaRepository.save(venta);
  }

  findAll(): Promise<Venta[]> {
    return this.ventaRepository.find({ relations: ['detalles'] });
  }

  async findOne(id: number): Promise<Venta> {
    const venta = await this.ventaRepository.findOne({
      where: { id },
      relations: ['detalles'],
    });

    if (!venta) {
      throw new NotFoundException(`Venta con ID ${id} no encontrada`);
    }

    return venta;
  }

  async update(id: number, actualizarVentaDto: ActualizarVentaDto): Promise<Venta> {
    const venta = await this.ventaRepository.preload({
      id,
      ...actualizarVentaDto,
    });

    if (!venta) {
      throw new NotFoundException(`Venta con ID ${id} no encontrada`);
    }

    return this.ventaRepository.save(venta);
  }

  async remove(id: number): Promise<void> {
    const venta = await this.findOne(id);
    await this.ventaRepository.remove(venta);
  }
}
