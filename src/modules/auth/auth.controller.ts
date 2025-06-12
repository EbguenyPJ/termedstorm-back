import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterEmployeeDto } from './dto/register-employee.dto';
import { RegisterClientDto } from './dto/register-client.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';

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

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body(new ValidationPipe()) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
