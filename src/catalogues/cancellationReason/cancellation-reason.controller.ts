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
import { CancellationReasonService } from './cancellation-reason.service';
import { CreateCancellationReasonDto } from './dto/create-cancellation-reason.dto';
import { UpdateCancellationReasonDto } from './dto/update-cancellation-reason.dto';

@Controller('cancellation-reasons')
export class CancellationReasonController {
  constructor(
    private readonly cancellationReasonService: CancellationReasonService,
  ) {}

  @Post()
  create(@Body() dto: CreateCancellationReasonDto) {
    return this.cancellationReasonService.create(dto);
  }

  @Get()
  findAll() {
    return this.cancellationReasonService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.cancellationReasonService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCancellationReasonDto,
  ) {
    return this.cancellationReasonService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.cancellationReasonService.delete(id);
  }
}
