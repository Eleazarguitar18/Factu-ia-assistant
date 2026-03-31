import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateMailDto } from './dto/create-mail.dto';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import * as fs from 'fs';
import * as path from 'path';
import handlebars from 'handlebars';
@Injectable()
export class MailService implements OnModuleInit {
  // Definimos la ruta base hacia tus carpetas de la imagen
  private readonly templatesDir = path.join(
    process.cwd(),
    'src',
    'mail',
    'templates',
  );
  private resend: Resend;
  constructor(private configService: ConfigService) {
    // Lee la API Key de las variables de entorno de Render
    this.resend = new Resend(this.configService.get<string>('RESEND_API_KEY'));
  }

  onModuleInit() {
    this.registerPartials();
  }
  private registerPartials() {
    const partialsDir = path.join(this.templatesDir, 'partials');

    // Leemos y registramos el Header y Footer físicamente
    const headerSource = fs.readFileSync(
      path.join(partialsDir, 'header.hbs'),
      'utf8',
    );
    const footerSource = fs.readFileSync(
      path.join(partialsDir, 'footer.hbs'),
      'utf8',
    );

    handlebars.registerPartial('header', headerSource);
    handlebars.registerPartial('footer', footerSource);

    console.log('✅ Partials de correo registrados en Debian');
  }

  async sendWelcome(email: string, name: string) {
    try {
      // 1. Leer el archivo welcome.hbs directamente
      const source = fs.readFileSync(
        path.join(this.templatesDir, 'welcome.hbs'),
        'utf8',
      );

      // 2. Compilar (Handlebars buscará automáticamente {{> header}} y {{> footer}})
      const template = handlebars.compile(source);

      // 3. Generar el HTML final con los datos
      const htmlOutput = template({
        name: name,
        year: new Date().getFullYear(),
      });

      // 4. Enviarlo a Resend como HTML puro
      await this.resend.emails.send({
        from: 'Rutea <bienvenida@elecode.site>',
        to: email,
        subject: '¡Bienvenido a Rutea!',
        html: htmlOutput,
      });
    } catch (error) {
      console.error('Error al enviar el correo:', error);
      throw error;
    }
  }
  // 2. Método para Cambio de Contraseña
  async sendEmailChangePassword(email: string, name: string) {
    try {
      // 1. Leer el archivo welcome.hbs directamente
      const source = fs.readFileSync(
        path.join(this.templatesDir, 'password-changed.hbs'),
        'utf8',
      );

      // 2. Compilar (Handlebars buscará automáticamente {{> header}} y {{> footer}})
      const template = handlebars.compile(source);

      // 3. Generar el HTML final con los datos
      const htmlOutput = template({
        name: name,
        date: new Date().toLocaleDateString(),
      });
      await this.resend.emails.send({
        from: 'Rutea <seguridad@elecode.site>',
        to: email,
        subject: 'Seguridad de Rutea: Cambio de contraseña exitoso',
        html: htmlOutput,
      });
    } catch (error) {
      console.error('Error en sendEmailChangePassword:', error);
    }
  }

  async sendCode(email: string, name: string, code: string) {
    try {
      // 1. Leer el archivo welcome.hbs directamente
      const source = fs.readFileSync(
        path.join(this.templatesDir, 'reset-code.hbs'),
        'utf8',
      );

      // 2. Compilar (Handlebars buscará automáticamente {{> header}} y {{> footer}})
      const template = handlebars.compile(source);

      // 3. Generar el HTML final con los datos
      const htmlOutput = template({
        code: code,
        name: name,
        date: new Date().toLocaleDateString(),
      });
      await this.resend.emails.send({
        from: 'Rutea <seguridad@elecode.site>', // Ahora puedes usar tu dominio!
        to: email,
        subject: 'Código de verificación - Rutea',
        html: htmlOutput,
      });
    } catch (error) {
      console.error('Error al enviar el correo:', error);
      throw error;
    }
  }

  async enviarCorreo({ email, message, subject, name }: CreateMailDto) {
    try {
      // 1. Leer el archivo welcome.hbs directamente
      const source = fs.readFileSync(
        path.join(this.templatesDir, 'generic-message.hbs'),
        'utf8',
      );

      // 2. Compilar (Handlebars buscará automáticamente {{> header}} y {{> footer}})
      const template = handlebars.compile(source);

      // 3. Generar el HTML final con los datos
      const htmlOutput = template({
        message: message,
        date: new Date().toLocaleDateString(),
        name: name,
      });
      // Generamos el HTML usando nuestra función de template

      const data = await this.resend.emails.send({
        from: 'Rutea <test@elecode.site>', // Tu dominio en Namecheap
        to: email,
        subject: subject,
        html: htmlOutput,
      });

      return {
        message: 'Correo enviado correctamente',
        id: data.data?.id,
      };
    } catch (error) {
      // Resend devuelve errores más claros que SMTP
      console.error('Error enviando correo con Resend:', error);
      throw new InternalServerErrorException('No se pudo enviar el mensaje');
    }
  }
}
