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
import { FacturasService } from './facturas.service';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';
import { AuthGuard } from '../auth/guards/auth.guard'; // Ajusta la ruta a tu AuthGuard real

@ApiTags('Facturas')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('facturas')
export class FacturasController {
  constructor(private readonly facturasService: FacturasService) {}

  @Post()
  @ApiOperation({
    summary: 'Registrar una nueva factura',
    description:
      'Crea el registro de una factura o comprobante de pago vinculándolo opcionalmente a un servicio fijo.',
  })
  @ApiResponse({ status: 201, description: 'Factura registrada con éxito.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({
    status: 401,
    description: 'No autorizado (Token inválido o ausente).',
  })
  async create(@Body() createFacturaDto: CreateFacturaDto, @Req() req: any) {
    const userId = req.user.sub;
    const data = await this.facturasService.create(createFacturaDto, userId);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Factura registrada con éxito.',
      data,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las facturas activas' })
  @ApiResponse({
    status: 200,
    description: 'Listado de facturas obtenido correctamente.',
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async findAll() {
    const data = await this.facturasService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Listado de facturas activas.',
      data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una factura por su ID' })
  @ApiResponse({ status: 200, description: 'Factura encontrada con éxito.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({
    status: 404,
    description: 'La factura no existe o fue dada de baja.',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.facturasService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      data,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar los datos de una factura por ID' })
  @ApiResponse({ status: 200, description: 'Factura actualizada con éxito.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Factura no encontrada.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFacturaDto: UpdateFacturaDto,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    const data = await this.facturasService.update(
      id,
      updateFacturaDto,
      userId,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Factura actualizada con éxito.',
      data,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una factura (Baja lógica)' })
  @ApiResponse({ status: 200, description: 'Factura dada de baja con éxito.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Factura no encontrada.' })
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user.sub;
    await this.facturasService.remove(id, userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Factura dada de baja con éxito (baja lógica).',
    };
  }
}
