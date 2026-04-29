import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityAudit } from 'src/common/entities/base-entity.audit';
import { SesionCaja } from 'src/cajas/entities/sesion-caja.entity';

@Entity('transacciones_agente')
export class TransaccionAgente extends BaseEntityAudit {
    @ApiProperty({ example: 1 })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ example: 'BCP', description: 'Banco o servicio (BCP, TIGO_MONEY, SOLI, BANCO_UNION)' })
    @Column()
    banco: string;

    @ApiProperty({
        example: 'DEPOSITO',
        enum: ['DEPOSITO', 'RETIRO', 'TRANSFERENCIA_QR'],
        description: 'Tipo de operación financiera'
    })
    @Column({
        type: 'enum',
        enum: ['DEPOSITO', 'RETIRO', 'TRANSFERENCIA_QR']
    })
    tipo_operacion: string;

    @ApiProperty({ example: 500.00, description: 'Monto que el cliente entrega o recibe' })
    @Column({ type: 'decimal', precision: 12, scale: 2 })
    monto: number;

    @ApiProperty({ example: 2.00, description: 'Comisión que la tienda cobra al cliente por el servicio' })
    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    comision_cliente: number;

    @ApiProperty({ example: 0.50, description: 'Comisión que el banco paga a la tienda' })
    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    comision_banco: number;

    @ApiProperty({ example: 'REF-12345678', description: 'Número de comprobante o referencia del banco' })
    @Column({ unique: true })
    nro_referencia: string;

    @ApiProperty({ example: 'storage/comprobantes/recibo_01.jpg', description: 'Ruta de la imagen del comprobante' })
    @Column({ nullable: true })
    url_comprobante: string;

    @ApiProperty({ description: 'Fecha y hora del registro' })
    @CreateDateColumn({ type: 'timestamp' })
    fecha: Date;

    @ManyToOne(() => SesionCaja)
    @JoinColumn({ name: 'id_sesion_caja' })
    sesion_caja: SesionCaja;

    @ApiProperty({ example: 101, description: 'Sesión de caja donde se realizó el movimiento' })
    @Column({ name: 'id_sesion_caja' })
    id_sesion_caja: number;
}