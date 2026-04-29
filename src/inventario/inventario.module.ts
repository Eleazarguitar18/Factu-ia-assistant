import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventarioService } from './inventario.service';
import { InventarioController } from './inventario.controller';
import { CategoriasController } from './categorias.controller';
import { Producto } from './entities/producto.entity';
import { Categoria } from './entities/categoria.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Producto, Categoria])],
  controllers: [InventarioController, CategoriasController],
  providers: [InventarioService],
})
export class InventarioModule {}
