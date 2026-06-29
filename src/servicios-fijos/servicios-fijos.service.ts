import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServicioFijo } from './entities/servicios-fijo.entity';
import { CreateServicioFijoDto } from './dto/create-servicios-fijo.dto';
import { UpdateServicioFijoDto } from './dto/update-servicios-fijo.dto';

@Injectable()
export class ServiciosFijosService {
  constructor(
    @InjectRepository(ServicioFijo)
    private readonly servicioFijoRepository: Repository<ServicioFijo>,
  ) {}

  async create(
    createServicioFijoDto: CreateServicioFijoDto,
    id_user_create: number,
  ): Promise<ServicioFijo> {
    const nuevoServicio = this.servicioFijoRepository.create(
      createServicioFijoDto,
    );

    // Inyección de auditoría para creación
    nuevoServicio.id_user_create = id_user_create;
    nuevoServicio.estado = true;

    try {
      return await this.servicioFijoRepository.save(nuevoServicio);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al registrar el servicio fijo en la base de datos.',
      );
    }
  }

  async findAll(): Promise<ServicioFijo[]> {
    return await this.servicioFijoRepository.find({
      where: { estado: true },
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<ServicioFijo> {
    const servicio = await this.servicioFijoRepository.findOneBy({
      id,
      estado: true,
    });
    if (!servicio) {
      throw new NotFoundException(
        `El servicio fijo con ID ${id} no existe o fue dado de baja.`,
      );
    }
    return servicio;
  }

  async update(
    id: number,
    updateServicioFijoDto: UpdateServicioFijoDto,
    id_user_update: number,
  ): Promise<ServicioFijo> {
    const servicio = await this.findOne(id);

    // Fusionamos los cambios del DTO en la entidad encontrada
    const servicioEditado = this.servicioFijoRepository.merge(
      servicio,
      updateServicioFijoDto,
    );

    // Inyección de auditoría para modificación
    servicioEditado.id_user_update = id_user_update;

    try {
      return await this.servicioFijoRepository.save(servicioEditado);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al actualizar el servicio fijo.',
      );
    }
  }

  async remove(id: number, id_user_update: number): Promise<ServicioFijo> {
    const servicio = await this.findOne(id);

    // Baja lógica modificando las propiedades de la clase de auditoría
    servicio.estado = false;
    servicio.id_user_update = id_user_update;

    try {
      return await this.servicioFijoRepository.save(servicio);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al dar de baja el servicio fijo.',
      );
    }
  }
}
