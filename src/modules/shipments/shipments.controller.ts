import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { UpdateShipmentDto } from './dtos/update-shipment.dto';
import { CreateShipmentDto } from './dtos/create-shipment.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ShipmentsCsvService } from './csv/shipments-csv.service';
@Controller('shipments')
export class ShipmentsController {
  constructor(
    private readonly shipmentsService: ShipmentsService,
    private readonly csvService: ShipmentsCsvService
  ) {}

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

  @Get('csv/download')
  async downloadCsv(@Res() res: Response) {
    const filePath = await this.csvService.createCsvFromDatabase('embarques');
    res.download(filePath);
  }

  @Post('csv/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCsv(@UploadedFile() file: Express.Multer.File) {
    return this.csvService.loadCsvToDatabase(file);
  }
}