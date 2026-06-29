import { PartialType } from '@nestjs/swagger';
import { CreateServicioFijoDto } from './create-servicios-fijo.dto';

export class UpdateServicioFijoDto extends PartialType(CreateServicioFijoDto) {}
