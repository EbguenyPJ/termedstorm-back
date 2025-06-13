import { IsNotEmpty, IsString, IsUUID } from "class-validator";


export class CreateProductModificationDto {
  @IsUUID()
  @IsNotEmpty()
  idProduct: string;

  @IsString()
  @IsNotEmpty()
  modificationFieldName: string;

  @IsString()
  @IsNotEmpty()
  previousState: string;

  @IsString()
  @IsNotEmpty()
  currentState: string;

  @IsUUID()
  @IsNotEmpty()
  idEmployee: string;
}
