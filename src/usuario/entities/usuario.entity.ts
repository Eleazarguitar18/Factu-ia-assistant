import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne, ManyToOne } from 'typeorm';
import { Persona } from '../../persona/entities/persona.entity';
import { Role } from 'src/auth/entities/role.entity';
import { BaseEntityAudit } from 'src/common/entities/base-entity.audit';

@Entity({ name: 'user' })
export class Usuario extends BaseEntityAudit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 150, unique: true })
  email: string;

  @Column()
  password: string;

  @OneToOne(() => Persona, { eager: true })
  @JoinColumn({ name: 'id_persona' })
  persona: Persona;

  @ManyToOne(() => Role, (role) => role.usuarios)
  @JoinColumn({ name: 'id_role' })
  role: Role;
}
