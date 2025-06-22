import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Color } from './entities/colorProduct.entity';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';
import { instanceToPlain } from 'class-transformer';
import { TenantConnectionService } from 'src/common/tenant-connection/tenant-connection.service';

@Injectable()
export class ColorService {
  constructor(
    // @InjectRepository(Color)
    // private readonly colorRepository: Repository<Color>,
    private readonly tenantConnectionService: TenantConnectionService,
  ) {}

  private getColorRepository(): Repository<Color> {
    const dataSource =
      this.tenantConnectionService.getTenantDataSourceFromContext();
    return dataSource.getRepository(Color);
  }

  async create(createDto: CreateColorDto) {
    const colorRepository = this.getColorRepository();

    const exists = await colorRepository.findOneBy({
      color: createDto.color.trim(),
    });
    if (exists) {
      throw new BadRequestException(
        `Color '${createDto.color}' already exists`,
      );
    }

    const color = colorRepository.create(createDto);
    const saved = await colorRepository.save(color);
    return instanceToPlain(saved);
  }

  async findAll() {
    const colorRepository = this.getColorRepository();

    const data = await colorRepository.find();
    return instanceToPlain(data);
  }

  async findOne(id: string) {
    const colorRepository = this.getColorRepository();

    const color = await colorRepository.findOne({ where: { id } });
    if (!color) throw new NotFoundException(`Color with id ${id} not found`);
    return instanceToPlain(color);
  }

  async update(id: string, updateDto: UpdateColorDto) {
    const colorRepository = this.getColorRepository();

    const color = await colorRepository.findOneBy({ id });
    if (!color) throw new NotFoundException(`Color with id ${id} not found`);

    const updated = colorRepository.merge(color, updateDto);
    const saved = await colorRepository.save(updated);
    return instanceToPlain(saved);
  }

  async remove(id: string) {
    const colorRepository = this.getColorRepository();

    const color = await colorRepository.findOneBy({ id });
    if (!color) throw new NotFoundException(`Color with id ${id} not found`);
    await colorRepository.update(id, { deleted_at: new Date() });
    return { message: `Color with id ${id} deleted successfully` };
  }
}
