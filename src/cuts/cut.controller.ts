import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CutsService } from './cut.service';
import { CreateCutDto } from './create-cutDto';
import { UpdateCutDto } from './update-cutDto';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

interface AuthRequest extends Request {
  user: {
    userId: string;
    email: string;
    name: string;
    roles: string[];
  };
}

@ApiTags('Cortes')
@ApiBearerAuth()
@Controller('cuts')
export class CutsController {
  constructor(private readonly cutsService: CutsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Crear un corte' })
  @ApiBody({ type: CreateCutDto })
  create(@Body() dto: CreateCutDto, @Req() req: AuthRequest) {
    return this.cutsService.create(dto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los cortes' })
  findAll() {
    return this.cutsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un corte por ID' })
  @ApiParam({ name: 'id', description: 'El UUID del corte', type: 'string' })
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.cutsService.findOne(id);
  }

  @Get(':id/audits')
  @ApiOperation({ summary: 'Obtener auditorías por corte' })
  @ApiParam({ name: 'id', description: 'El UUID del corte', type: 'string' })
  getAuditsByCut(@Param('id') cutId: string) {
    return this.cutsService.getAuditsByCut(cutId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un corte por ID' })
  @ApiParam({ name: 'id', description: 'El UUID del corte', type: 'string' })
  @ApiBody({ type: UpdateCutDto })
  update(@Param('id') id: string, @Body() dto: UpdateCutDto) {
    return this.cutsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un corte por ID' })
  @ApiParam({ name: 'id', description: 'El UUID del corte', type: 'string' })
  remove(@Param('id', ParseIntPipe) id: string) {
    return this.cutsService.remove(id);
  }
}
