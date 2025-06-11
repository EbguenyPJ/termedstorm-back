import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterEmployeeDto } from './dto/register-employee.dto';
import { RegisterClientDto } from './dto/register-client.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/employee')
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
}
