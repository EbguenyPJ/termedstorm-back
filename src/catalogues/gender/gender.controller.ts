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
import { GenderService } from './gender.service';
import { CreateGenderDto } from './dto/create-gender.dto';
import { UpdateGenderDto } from './dto/update-gender.dto';

@Controller('gender')
export class GenderController {
  constructor(private readonly genderService: GenderService) {}

  @Post()
  create(@Body() dto: CreateGenderDto) {
    return this.genderService.create(dto);
  }

  @Get()
  findAll() {
    return this.genderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.genderService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateGenderDto) {
    return this.genderService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.genderService.delete(id);
  }
}
