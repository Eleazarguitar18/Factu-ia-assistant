import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { DetalleVenta } from './detalle-venta.entity';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityAudit } from 'src/common/entities/base-entity.audit';
import { SesionCaja } from 'src/cajas/entities/sesion-caja.entity';

@Entity('venta')
export class Venta extends BaseEntityAudit {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 150.50, description: 'Suma total de los productos vendidos' })
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total: number;

  @ApiProperty({ example: 'EFECTIVO', enum: ['EFECTIVO', 'QR', 'TRANSFERENCIA'] })
  @Column()
  metodo_pago: string;

  @ApiProperty({ description: 'Fecha y hora de la transacción' })
  @CreateDateColumn({ type: 'timestamp' })
  fecha: Date;

  @ManyToOne(() => SesionCaja)
  @JoinColumn({ name: 'id_sesion_caja' })
  sesion_caja: SesionCaja;

  @ApiProperty({ example: 101 })
  @Column({ name: 'id_sesion_caja' })
  id_sesion_caja: number;

  @OneToMany(() => DetalleVenta, (detalle) => detalle.venta, { cascade: true })
  detalles: DetalleVenta[];

  @ApiProperty({ example: 'COMPLETADA', enum: ['COMPLETADA', 'ANULADA', 'EDITADA'] })
  @Column({ name: 'estado_venta', default: 'COMPLETADA' })
  estado_venta: string;

  @ApiProperty({ example: 'Error en el método de pago' })
  @Column({ type: 'text', nullable: true })
  motivo_edicion: string;

  @UpdateDateColumn({ type: 'timestamp' })
  fecha_modificacion: Date;
}