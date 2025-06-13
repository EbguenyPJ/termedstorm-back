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
import { CancelReasonService } from './cancel-reason.service';
import { CreateCancelReasonDto } from './dto/create-cancel-reason.dto';
import { UpdateCancelReasonDto } from './dto/update-cancel-reason.dto';

@Controller('cancel-reasons')
export class CancelReasonController {
  constructor(private readonly cancelReasonService: CancelReasonService) {}

  @Post()
  create(@Body() dto: CreateCancelReasonDto) {
    return this.cancelReasonService.create(dto);
  }

  @Get()
  findAll() {
    return this.cancelReasonService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.cancelReasonService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateCancelReasonDto) {
    return this.cancelReasonService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.cancelReasonService.delete(id);
  }
}
