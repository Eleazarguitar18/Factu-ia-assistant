import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntityAudit } from '../../common/entities/base-entity.audit';
import { ServicioFijo } from 'src/servicios-fijos/entities/servicios-fijo.entity';

@Entity({ name: 'facturas' })
export class Factura extends BaseEntityAudit {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'monto' })
  monto: number;

  @Column({ type: 'varchar', length: 50, name: 'mes_periodo' })
  mes_periodo: string; // Ej: 'enero', 'febrero'

  @Column({ type: 'integer', name: 'anho' })
  anho: number; // Ej: 2026

  @Column({ type: 'text', name: 'comprobante_url' })
  comprobante_url: string; // Enlace al archivo guardado (ej. Google Drive)

  @Column({ type: 'varchar', length: 50, name: 'canal_origen' })
  canal_origen: string; // Ej: 'whatsapp', 'web', 'manual'

  // Llave foránea vinculada al servicio fijo correspondiente
  @Column({ type: 'integer', name: 'servicio_fijo_id', nullable: true })
  servicio_fijo_id: number;

  // Relación ManyToOne con la entidad ServicioFijo
  @ManyToOne(() => ServicioFijo, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'servicio_fijo_id' })
  servicio_fijo: ServicioFijo;
}
