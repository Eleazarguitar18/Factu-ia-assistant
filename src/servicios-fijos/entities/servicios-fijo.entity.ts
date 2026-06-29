import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntityAudit } from '../../common/entities/base-entity.audit';

@Entity({ name: 'servicios_fijos' })
export class ServicioFijo extends BaseEntityAudit {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @Column({ type: 'varchar', length: 100, name: 'nombre_servicio' })
  nombre_servicio: string; // Ej: 'entel internet', 'delapaz luz'

  @Column({ type: 'varchar', length: 50, name: 'codigo_cliente' })
  codigo_cliente: string; // El número de cuenta o código fijo

  @Column({ type: 'text', nullable: true, name: 'descripcion' })
  descripcion?: string;
}
