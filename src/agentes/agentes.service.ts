import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransaccionAgente } from './entities/transaccion-agente.entity';
import { CrearTransaccionAgenteDto } from './dto/crear-transaccion-agente.dto';

@Injectable()
export class AgentesService {
  constructor(
    @InjectRepository(TransaccionAgente)
    private readonly transaccionAgenteRepository: Repository<TransaccionAgente>,
  ) {}

  async create(crearTransaccionAgenteDto: CrearTransaccionAgenteDto): Promise<TransaccionAgente> {
    const transaccion = this.transaccionAgenteRepository.create(crearTransaccionAgenteDto);
    return await this.transaccionAgenteRepository.save(transaccion);
  }

  async findAll(): Promise<TransaccionAgente[]> {
    return await this.transaccionAgenteRepository.find();
  }

  async findOne(id: number): Promise<TransaccionAgente> {
    const transaccion = await this.transaccionAgenteRepository.findOneBy({ id });
    if (!transaccion) {
      throw new NotFoundException(`Transacción de agente con ID ${id} no encontrada`);
    }
    return transaccion;
  }

  async remove(id: number): Promise<void> {
    const transaccion = await this.findOne(id);
    await this.transaccionAgenteRepository.remove(transaccion);
  }
}
