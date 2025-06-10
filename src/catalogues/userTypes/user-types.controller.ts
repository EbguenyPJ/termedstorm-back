import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UserTypeService } from './user-types.service';
import { CreateUserTypeDto } from './dto/create-user-type.dto';
import { UpdateUserTypeDto } from './dto/update-user-type.dto';

@Controller('user-types')
export class UserTypeController {
  constructor(private readonly userTypeService: UserTypeService) {}

  @Post()
  create(@Body() createDto: CreateUserTypeDto) {
    return this.userTypeService.create(createDto);
  }

  @Get()
  findAll() {
    return this.userTypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.userTypeService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() updateDto: UpdateUserTypeDto) {
    return this.userTypeService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.userTypeService.delete(id);
  }
}
