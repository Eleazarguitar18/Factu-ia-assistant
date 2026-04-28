import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrearProductoDto } from './dto/crear-producto.dto';
import { ActualizarProductoDto } from './dto/actualizar-producto.dto';
import { Producto } from './entities/producto.entity';
import { Categoria } from './entities/categoria.entity';

@Injectable()
export class InventarioService {
  constructor(
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
  ) {}

  async create(crearProductoDto: CrearProductoDto): Promise<Producto> {
    const { categoriaId, ...productoData } = crearProductoDto;
    
    const categoria = await this.categoriaRepository.findOneBy({ id: categoriaId });
    if (!categoria) {
      throw new NotFoundException(`Categoría con id ${categoriaId} no encontrada`);
    }

    const producto = this.productoRepository.create({
      ...productoData,
      categoria,
    });

    return await this.productoRepository.save(producto);
  }

  async findAll(): Promise<Producto[]> {
    return await this.productoRepository.find({
      relations: ['categoria'],
    });
  }

  async findOne(id: number): Promise<Producto> {
    const producto = await this.productoRepository.findOne({
      where: { id },
      relations: ['categoria'],
    });
    
    if (!producto) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }
    
    return producto;
  }

  async update(id: number, actualizarProductoDto: ActualizarProductoDto): Promise<Producto> {
    const { categoriaId, ...updateData } = actualizarProductoDto;
    
    const producto = await this.productoRepository.preload({
      id,
      ...updateData,
    });

    if (!producto) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }

    if (categoriaId) {
      const categoria = await this.categoriaRepository.findOneBy({ id: categoriaId });
      if (!categoria) {
        throw new NotFoundException(`Categoría con id ${categoriaId} no encontrada`);
      }
      producto.categoria = categoria;
    }

    return await this.productoRepository.save(producto);
  }

  async remove(id: number): Promise<void> {
    const producto = await this.findOne(id);
    await this.productoRepository.remove(producto);
  }
}
