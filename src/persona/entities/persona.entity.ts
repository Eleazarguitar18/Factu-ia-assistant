import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntityAudit } from 'src/common/entities/base-entity.audit';

@Entity({ name: 'persona' })
export class Persona extends BaseEntityAudit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombres: string;

  @Column({ length: 50 })
  p_apellido: string;

  @Column({ length: 50, nullable: true })
  s_apellido?: string;

  @Column({ type: 'date' })
  fecha_nacimiento: Date;

  @Column({ length: 10 })
  genero: string;
}
