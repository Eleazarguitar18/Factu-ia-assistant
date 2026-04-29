import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Venta } from './venta.entity';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityAudit } from 'src/common/entities/base-entity.audit';
import { Producto } from 'src/inventario/entities/producto.entity';

@Entity('detalles_venta')
export class DetalleVenta extends BaseEntityAudit {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 2, description: 'Cantidad de unidades vendidas' })
  @Column()
  cantidad: number;

  @ApiProperty({ example: 45.00, description: 'Precio unitario al momento de la venta' })
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  precio_unitario: number;

  @ApiProperty({ example: 90.00, description: 'Subtotal (cantidad * precio)' })
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal: number;

  @ManyToOne(() => Venta, (venta) => venta.detalles)
  @JoinColumn({ name: 'id_venta' })
  venta: Venta;

  @Column({ name: 'id_venta' })
  id_venta: number;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'id_producto' })
  producto: Producto;

  @ApiProperty({ example: 5, description: 'ID del producto vendido' })
  @Column({ name: 'id_producto' })
  id_producto: number;
}