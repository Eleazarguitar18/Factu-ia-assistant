import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  Max,
  Min,
  IsOptional,
} from 'class-validator';

export class CreateFacturaDto {
  @ApiProperty({
    description: 'Monto total cancelado en la factura',
    example: 250.5,
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El monto debe ser un número válido con máximo 2 decimales.' },
  )
  @IsPositive({ message: 'El monto debe ser mayor a 0.' })
  monto: number;

  @ApiProperty({
    description: 'Mes correspondiente al periodo del servicio',
    example: 'junio',
  })
  @IsString()
  @IsNotEmpty({ message: 'El mes del periodo es requerido.' })
  mes_periodo: string;

  @ApiProperty({
    description: 'Año correspondiente al periodo del servicio',
    example: 2026,
  })
  @IsNumber({}, { message: 'El año debe ser un número entero.' })
  @Min(2000, { message: 'El año ingresado no es válido.' })
  @Max(2100, { message: 'El año excede el límite permitido.' })
  anho: number;

  @ApiProperty({
    description: 'URL de almacenamiento del comprobante digital de la factura',
    example: 'https://drive.google.com/file/d/1a2b3c4d5e/view',
  })
  @IsString()
  @IsNotEmpty({ message: 'La URL del comprobante es requerida.' })
  comprobante_url: string;

  @ApiProperty({
    description:
      'Canal o medio por el cual se registró la factura en el sistema',
    example: 'whatsapp',
  })
  @IsString()
  @IsNotEmpty({ message: 'El canal de origen es requerido.' })
  canal_origen: string;

  @ApiProperty({
    description:
      'ID del servicio fijo al que pertenece la factura (opcional si no se logra identificar)',
    example: 1,
    required: false,
  })
  @IsNumber(
    {},
    { message: 'El ID del servicio fijo debe ser un número entero.' },
  )
  @IsOptional()
  servicio_fijo_id?: number;
}
