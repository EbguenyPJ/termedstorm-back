import {
  Controller,
  Get,
  Param,
  Body,
  Patch,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CancellationService } from './cancellation.service';
import { UpdateCancellationDto } from './dto/update-cancellation.dto';

@Controller('cancellations')
export class CancellationController {
  constructor(private readonly cancellationService: CancellationService) {}

  //LA CANCELACION DE LA ORDEN SE HACE A  traves de "orders", para que pueda seguir un flujo.
  // estas funcionalidades son de consulta y actualizacion

  @Get()
  // @UseGuards(AuthGuard)
  findAll() {
    return this.cancellationService.findAll();
  }

  @Get(':id')
  // @UseGuards(AuthGuard)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.cancellationService.findOne(id);
  }

  @Patch(':id')
  // @UseGuards(AuthGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCancellationDto: UpdateCancellationDto,
  ) {
    return this.cancellationService.update(id, updateCancellationDto);
  }
}
