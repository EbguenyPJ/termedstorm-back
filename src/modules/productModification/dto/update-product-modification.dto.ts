import { PartialType } from '@nestjs/mapped-types';
import { CreateProductModificationDto } from './create-product-modification.dto';

export class UpdateProductModificationDto extends PartialType(CreateProductModificationDto) {}
