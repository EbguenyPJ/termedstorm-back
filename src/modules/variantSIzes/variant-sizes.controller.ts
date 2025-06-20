import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseUUIDPipe,
} from '@nestjs/common';
import { VariantSizesService } from './variant-sizes.service';
import { CreateVariantSizeDto } from './dto/create-variant-sizes.dto';
import { UpdateVariantSizeDto } from './dto/update-variant-sizes.dto';
import { ProductVariant } from '../productsVariant/entities/product-variant.entity';
import { EntityManager } from 'typeorm';

@Controller('variant-sizes')
export class VariantSizesController {
  constructor(private readonly variantSizesService: VariantSizesService) {}

  @Post()
  create(@Body() createDto: CreateVariantSizeDto, variantProduct: ProductVariant, manager: EntityManager) {
    return this.variantSizesService.create(createDto, variantProduct, manager);
  }

  @Get()
  findAll() {
    return this.variantSizesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.variantSizesService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateDto: UpdateVariantSizeDto,
  ) {
    return this.variantSizesService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.variantSizesService.remove(id);
  }
}
