import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentesService } from './agentes.service';
import { AgentesController } from './agentes.controller';
import { TransaccionAgente } from './entities/transaccion-agente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TransaccionAgente])],
  controllers: [AgentesController],
  providers: [AgentesService],
})
export class AgentesModule {}
