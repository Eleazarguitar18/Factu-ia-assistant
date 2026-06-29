import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Factura } from './entities/factura.entity';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';

@Injectable()
export class FacturasService {
  constructor(
    @InjectRepository(Factura)
    private readonly facturaRepository: Repository<Factura>,
  ) {}

  async create(
    createFacturaDto: CreateFacturaDto,
    id_user_create: number,
  ): Promise<Factura> {
    const nuevaFactura = this.facturaRepository.create(createFacturaDto);

    // Inyección de campos de auditoría heredados de BaseEntityAudit
    nuevaFactura.id_user_create = id_user_create;
    nuevaFactura.estado = true;

    try {
      return await this.facturaRepository.save(nuevaFactura);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al registrar la factura en la base de datos.',
      );
    }
  }

  async findAll(): Promise<Factura[]> {
    // Retorna las facturas activas e incluye los datos del servicio fijo asociado si existe
    return await this.facturaRepository.find({
      where: { estado: true },
      relations: ['servicio_fijo'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Factura> {
    const factura = await this.facturaRepository.findOne({
      where: { id, estado: true },
      relations: ['servicio_fijo'],
    });

    if (!factura) {
      throw new NotFoundException(
        `La factura con ID ${id} no existe o fue dada de baja.`,
      );
    }
    return factura;
  }

  async update(
    id: number,
    updateFacturaDto: UpdateFacturaDto,
    id_user_update: number,
  ): Promise<Factura> {
    const factura = await this.findOne(id);

    // Fusionamos las propiedades modificadas del DTO en la factura existente
    const facturaEditada = this.facturaRepository.merge(
      factura,
      updateFacturaDto,
    );

    // Inyección de auditoría para la modificación
    facturaEditada.id_user_update = id_user_update;

    try {
      return await this.facturaRepository.save(facturaEditada);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al actualizar los datos de la factura.',
      );
    }
  }

  async remove(id: number, id_user_update: number): Promise<Factura> {
    const factura = await this.findOne(id);

    // Aplicamos baja lógica cambiando el estado heredado del BaseEntityAudit
    factura.estado = false;
    factura.id_user_update = id_user_update;

    try {
      return await this.facturaRepository.save(factura);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al dar de baja la factura.',
      );
    }
  }
}
