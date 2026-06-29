import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Req,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ServiciosFijosService } from './servicios-fijos.service';
import { CreateServicioFijoDto } from './dto/create-servicios-fijo.dto';
import { UpdateServicioFijoDto } from './dto/update-servicios-fijo.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@ApiTags('Servicios Fijos')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('servicios-fijos')
export class ServiciosFijosController {
  constructor(private readonly serviciosFijosService: ServiciosFijosService) {}

  @Post()
  @ApiOperation({
    summary: 'Registrar un nuevo servicio fijo',
    description:
      'Crea un servicio (como entel, delapaz, etc.) con su código para consultas rápidas.',
  })
  @ApiResponse({
    status: 201,
    description: 'Servicio fijo registrado correctamente.',
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({
    status: 401,
    description: 'No autorizado (Token inválido o ausente).',
  })
  async create(
    @Body() createServicioFijoDto: CreateServicioFijoDto,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    const data = await this.serviciosFijosService.create(
      createServicioFijoDto,
      userId,
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Servicio fijo registrado correctamente.',
      data,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los servicios fijos activos' })
  @ApiResponse({
    status: 200,
    description: 'Listado de servicios fijos activos obtenido correctamente.',
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async findAll() {
    const data = await this.serviciosFijosService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Listado de servicios fijos activos.',
      data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un servicio fijo por su ID' })
  @ApiResponse({ status: 200, description: 'Servicio fijo encontrado.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({
    status: 404,
    description: 'El servicio fijo no existe o fue dado de baja.',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.serviciosFijosService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      data,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un servicio fijo por ID' })
  @ApiResponse({
    status: 200,
    description: 'Servicio fijo actualizado correctamente.',
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Servicio fijo no encontrado.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateServicioFijoDto: UpdateServicioFijoDto,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    const data = await this.serviciosFijosService.update(
      id,
      updateServicioFijoDto,
      userId,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Servicio fijo actualizado correctamente.',
      data,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un servicio fijo (Baja lógica)' })
  @ApiResponse({
    status: 200,
    description: 'Servicio fijo eliminado correctamente.',
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Servicio fijo no encontrado.' })
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user.sub;
    await this.serviciosFijosService.remove(id, userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Servicio fijo eliminado correctamente (baja lógica).',
    };
  }
}
