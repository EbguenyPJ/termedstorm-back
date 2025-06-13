import { Injectable, BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import * as fs from 'fs';
import * as csv from 'csv-parser';
import { CsvUploadResult } from './interfaces/csv-upload-result.interface';
import { ProductService } from '../products/product.service';
import { CreateProductDto } from '../products/dto/create-product.dto';

@Injectable()
export class CsvUploadService {
  constructor(
    private readonly productService: ProductService,
  ) {}
  async parseAndValidate<T extends object>(
    filePath: string,
    dtoClass: new () => T,
  ): Promise<CsvUploadResult<T>> {
    const validRows: T[] = [];
    const invalidRows: CsvUploadResult<T>['errors'] = [];

    return new Promise((resolve, reject) => {
      let rowIndex = 1;

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', async (data) => {
          const dtoInstance = plainToInstance(dtoClass, data);
          const errors = await validate(dtoInstance);

          if (errors.length > 0) {
            invalidRows.push({
              row: rowIndex,
              errors: errors.flatMap((err) =>
                Object.values(err.constraints || {}),
              ),
            });
          } else {
            validRows.push(dtoInstance);
          }

          rowIndex++;
        })
        .on('end', () => {
          fs.unlink(filePath, () => {});
          resolve({ validData: validRows, errors: invalidRows });
        })
        .on('error', (err) => {
          reject(new BadRequestException('Error parsing CSV: ' + err.message));
        });
    });
  }

  async processCsv(filePath: string) {
  const result = await this.parseAndValidate<CreateProductDto>(
    filePath,
    CreateProductDto,
  );

  const saved = await this.productService.saveMany(result.validData);

  return {
    message: 'CSV processed',
    savedCount: saved.length,
    errors: result.errors,
  };
}
}
