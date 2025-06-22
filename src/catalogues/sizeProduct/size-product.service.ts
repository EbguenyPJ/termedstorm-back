import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Size } from './entities/size-product.entity';
import { Repository, DataSource } from 'typeorm';
import { CreateSizeDto } from './dto/create-size.dto';
import { UpdateSizeDto } from './dto/update-size.dto';
import { instanceToPlain } from 'class-transformer';
import { TenantConnectionService } from 'src/common/tenant-connection/tenant-connection.service';

@Injectable()
export class SizeService {
  constructor(
    // @InjectRepository(Size)
    // private readonly sizeRepository: Repository<Size>,
    private readonly tenantConnectionService: TenantConnectionService,
  ) {}

  private getSizeRepository(): Repository<Size> {
    const dataSource =
      this.tenantConnectionService.getTenantDataSourceFromContext();
    return dataSource.getRepository(Size);
  }

  async create(createDto: CreateSizeDto): Promise<any> {
    const sizeRepository = this.getSizeRepository();

    const existing = await sizeRepository.findOne({
      where: {
        size_us: createDto.size_us,
        size_eur: createDto.size_eur,
        size_cm: createDto.size_cm,
      },
    });

    if (existing) {
      throw new BadRequestException(`This size already exists`);
    }

    const size = sizeRepository.create(createDto);
    const saved = await sizeRepository.save(size);
    return instanceToPlain(saved);
  }

  async findAll(): Promise<any> {
    const sizeRepository = this.getSizeRepository();

    const sizes = await sizeRepository.find();
    return instanceToPlain(sizes);
  }

  async findOne(id: string): Promise<any> {
    const sizeRepository = this.getSizeRepository();

    const size = await sizeRepository.findOne({ where: { id } });
    if (!size) {
      throw new NotFoundException(`Size with id ${id} not found`);
    }
    return instanceToPlain(size);
  }

  async update(id: string, updateDto: UpdateSizeDto): Promise<any> {
    const sizeRepository = this.getSizeRepository();

    const size = await sizeRepository.findOne({ where: { id } });
    if (!size) {
      throw new NotFoundException(`Size with id ${id} not found`);
    }

    await sizeRepository.update(id, updateDto);
    return { message: `Size with id ${id} updated successfully` };
  }

  async remove(id: string): Promise<any> {
    const sizeRepository = this.getSizeRepository();

    const size = await sizeRepository.findOne({ where: { id } });
    if (!size) {
      throw new NotFoundException(`Size with id ${id} not found`);
    }

    await sizeRepository.softDelete(id);
    return { message: `Size with id ${id} deleted successfully` };
  }
}
