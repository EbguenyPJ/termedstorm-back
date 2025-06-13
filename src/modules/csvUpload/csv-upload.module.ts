import { Module } from '@nestjs/common';
import { CsvUploadService } from './csv-upload.service';
import { CsvUploadController } from './csv-upload.controller';
import { ProductModule } from '../products/product.module';

@Module({
  imports: [ProductModule],
  controllers: [CsvUploadController],
  providers: [CsvUploadService],
  exports: [CsvUploadService],
})
export class CsvUploadModule {}