import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Put,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { UpdateShipmentDto } from './dtos/update-shipment.dto';
import { CreateShipmentDto } from './dtos/create-shipment.dto';

@Controller('shipments')
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Post()
  create(@Body() dto: CreateShipmentDto) {
    return this.shipmentsService.create(dto);
  }

  @Get()
  findAll() {
    return this.shipmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.shipmentsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateShipmentDto,
  ) {
    return this.shipmentsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.shipmentsService.remove(id);
  }
}