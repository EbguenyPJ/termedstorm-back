import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
//! sistema de autorización para admins globales
// import { Roles } from 'src/modules/auth/decorators/roles.decorator';
// import { Role } from 'src/modules/roles/entities/role.entity';
// import { UseGuards } from '@nestjs/common';
// import { RolesGuard } from 'src/modules/auth/guards/roles.guard';

@Controller('customers')
// @UseGuards(RolesGuard) 
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  // @Roles(Role.SuperAdmin) 
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.create(createCustomerDto);
  }

  @Get()
  // @Roles(Role.SuperAdmin, Role.Admin) 
  findAll() {
    return this.customerService.findAll();
  }

  @Get(':id')
  // @Roles(Role.SuperAdmin, Role.Admin)
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(id);
  }

  @Patch(':id')
  // @Roles(Role.SuperAdmin)
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customerService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  // @Roles(Role.SuperAdmin)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.customerService.remove(id);
  }
}
