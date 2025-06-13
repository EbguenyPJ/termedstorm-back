import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CsvUploadService } from './csv-upload.service';

@Controller('csv-upload')
export class CsvUploadController {
  constructor(private readonly csvUploadService: CsvUploadService) {}

  @Post('products')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.csv$/)) {
          return cb(new BadRequestException('Only CSV files are allowed!'), false);
        }
        cb(null, true);
      },
    })
  )
  async uploadProductCSV(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const result = await this.csvUploadService.processCsv(file.path);
    return {
      message: result.message,
      savedCount: result.savedCount,
      total: result.savedCount + result.errors.length,
      valid: result.savedCount,
      invalid: result.errors.length,
      errors: result.errors,
    };
  }
}