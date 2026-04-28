import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { AgentesService } from './agentes.service';
import { CrearTransaccionAgenteDto } from './dto/crear-transaccion-agente.dto';

@Controller('agentes')
export class AgentesController {
  constructor(private readonly agentesService: AgentesService) { }

  @Post()
  create(@Body() crearTransaccionAgenteDto: CrearTransaccionAgenteDto) {
    return this.agentesService.create(crearTransaccionAgenteDto);
  }

  @Get()
  findAll() {
    return this.agentesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agentesService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.agentesService.remove(+id);
  }
}
