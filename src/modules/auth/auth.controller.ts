import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Res,
  Get,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterEmployeeDto } from './dto/register-employee.dto';
import { RegisterClientDto } from './dto/register-client.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/employee')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  registerEmployee(
    @Body(new ValidationPipe()) registerEmployeeDto: RegisterEmployeeDto,
  ) {
    return this.authService.registerEmployee(registerEmployeeDto);
  }

  @Post('register/client')
  registerClient(
    @Body(new ValidationPipe()) registerClientDto: RegisterClientDto,
  ) {
    return this.authService.registerClient(registerClientDto);
  }

  //% 1. Establecer la cookie.
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const accessToken = await this.authService.login(loginDto);

    response.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Solo enviar por HTTPS en producción
      sameSite: 'strict', // Protección estricta contra CSRF   | lax  | none :La cookie se envía siempre, incluso en peticiones cross-site, pero requiere secure: true.
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    });

    return { message: 'Login successful' };
  }

  //% 1. Método login con jwt Token
  // @Post('login')
  // @HttpCode(HttpStatus.OK)
  // login(@Body(new ValidationPipe()) loginDto: LoginDto) {
  //   return this.authService.login(loginDto);
  // }

  //% 1. Método logout para eliminar la coockie
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token');
    return { message: 'Logout successful' };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: Request) {
    // Este endpoint simplemente activa el AuthGuard de Google,
    // que redirige al usuario a la página de consentimiento de Google.
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() response: Response) {
    // Passport adjunta el perfil del usuario (del método 'validate' de la estrategia) en req.user
    const userFromGoogle = req.user as { email: string };

    // Validación y obtención de token propio
    const accessToken =
      await this.authService.validateAndLoginGoogleUser(userFromGoogle);

    // Establecer la cookie como en el login tradicional
    response.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    // Redirigimos al usuario al frontend
    // URL de frontend tras login exitoso
    response.redirect('http://localhost....');
  }
}
