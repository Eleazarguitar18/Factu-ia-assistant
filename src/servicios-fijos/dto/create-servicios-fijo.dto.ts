import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, Length } from 'class-validator';

export class CreateServicioFijoDto {
  @ApiProperty({
    description: 'Nombre descriptivo del servicio de pago fijo',
    example: 'entel internet',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del servicio es requerido.' })
  @Length(3, 100, { message: 'El nombre debe tener entre 3 y 100 caracteres.' })
  nombre_servicio: string;

  @ApiProperty({
    description:
      'Código de cliente, número de cuenta, medidor o NIT asociado para realizar el pago',
    example: '10293847',
  })
  @IsString()
  @IsNotEmpty({
    message: 'El código de cliente o número de cuenta es requerido.',
  })
  @Length(2, 50, { message: 'El código debe tener entre 2 y 50 caracteres.' })
  codigo_cliente: string;

  @ApiProperty({
    description: 'Nota o descripción adicional del servicio',
    example: 'cuenta del internet fibra del departamento principal',
    required: false,
  })
  @IsString()
  @IsOptional()
  descripcion?: string;
}
