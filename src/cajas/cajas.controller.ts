import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { CajasService } from './cajas.service';
import { AbrirCajaDto } from './dto/abrir-caja.dto';
import { CerrarCajaDto } from './dto/cerrar-caja.dto';
import { CrearMovimientoDto } from './dto/crear-movimiento.dto';

@Controller('cajas')
export class CajasController {
  constructor(private readonly cajasService: CajasService) {}

  @Get()
  findAllCajas() {
    return this.cajasService.findAllCajas();
  }

  @Get(':id')
  findCaja(@Param('id') id: string) {
    return this.cajasService.findCaja(+id);
  }

  @Post('abrir')
  abrirCaja(@Body() abrirCajaDto: AbrirCajaDto) {
    return this.cajasService.abrirCaja(abrirCajaDto);
  }

  @Patch('sesion/:id/cerrar')
  cerrarCaja(@Param('id') id: string, @Body() cerrarCajaDto: CerrarCajaDto) {
    return this.cajasService.cerrarCaja(+id, cerrarCajaDto);
  }

  @Post('movimiento')
  crearMovimiento(@Body() crearMovimientoDto: CrearMovimientoDto) {
    return this.cajasService.crearMovimiento(crearMovimientoDto);
  }
}
