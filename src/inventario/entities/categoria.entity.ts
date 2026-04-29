import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Producto } from './producto.entity';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityAudit } from 'src/common/entities/base-entity.audit';

@Entity('categoria')
export class Categoria extends BaseEntityAudit {
  @ApiProperty({ example: 1, description: 'Identificador único de la categoría' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Cargadores', description: 'Nombre descriptivo de la categoría' })
  @Column({ unique: true })
  nombre: string;

  // Relación: Una categoría puede tener muchos productos
  @OneToMany(() => Producto, (producto) => producto.categoria)
  productos: Producto[];
}