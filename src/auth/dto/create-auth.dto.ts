import { IsString, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateAuthDto {
  @ApiProperty({
    example: 'admin',
    description: 'Nombre del usuario',
  })
  @IsString()
  @IsOptional()
  name?: string;
  @ApiProperty({
    example: 'admin@gmail.com',
    description: 'Correo electrónico del usuario',
  })
  @IsNotEmpty()
  @IsEmail({}, { message: 'El email no tiene un formato válido' })
  email: string;

  @ApiProperty({
    example: 'Miclave123!',
    description: 'Contraseña del usuario',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
  @ApiProperty({
    example: true,
    description: 'Estado del usuario',
  })
  @IsOptional()
  estado: boolean = true;
  // datos de la persona
  @ApiProperty({
    example: 'Factu',
    description: 'Nombre de la persona',
  })
  @IsString()
  @IsNotEmpty()
  nombres: string;
  @ApiProperty({
    example: 'Asistencia',
    description: 'Primer apellido de la persona',
  })
  @IsString()
  @IsNotEmpty()
  p_apellido: string;
  @ApiProperty({
    example: 'Soporte',
    description: 'Segundo apellido de la persona',
  })
  @IsString()
  @IsNotEmpty()
  s_apellido: string;
  @ApiProperty({
    example: '2001-07-07',
    description: 'Fecha de nacimiento de la persona',
  })
  @IsString()
  @IsNotEmpty()
  fecha_nacimiento: Date;
  @ApiProperty({
    example: 'M',
    description: 'Genero de la persona',
  })
  @IsString()
  @IsNotEmpty()
  genero: string;
  @ApiProperty({
    example: 1,
    description: 'ID del rol',
  })
  @IsOptional()
  // persona?: Persona;
  @IsOptional()
  id_role?: number;
}
