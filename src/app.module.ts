import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PersonaModule } from './persona/persona.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioModule } from './usuario/usuario.module';
import { JwtModule } from '@nestjs/jwt';
// import { jwtConstants } from './auth/config/constants';
import { MailModule } from './mail/mail.module';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisConfig } from './config/redis.config';
import { JwtConfig } from './config/jwt.config';
import { DatabaseConfig } from './config/database.config';
import { RedisManagerModule } from './redis-manager/redis-manager.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { GeminiModule } from './gemini/gemini.module';
import { AiAssistantModule } from './ai-assistant/ai-assistant.module';

import { GatewayModule } from './gateway/gateway.module';
import { FacturasModule } from './facturas/facturas.module';
import { ServiciosFijosModule } from './servicios-fijos/servicios-fijos.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync(RedisConfig),
    TypeOrmModule.forRootAsync(DatabaseConfig),
    JwtModule.registerAsync({
      ...JwtConfig,
      global: true, // Lo definimos aquí para evitar errores de tipo en la constante
    }),
    AuthModule,
    PersonaModule,
    UsuarioModule,
    MailModule,
    RedisManagerModule,
    WhatsappModule,
    GeminiModule,
    AiAssistantModule,
    GatewayModule,
    FacturasModule,
    ServiciosFijosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
