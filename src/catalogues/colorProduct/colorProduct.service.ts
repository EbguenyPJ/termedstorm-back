import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
//import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Color } from './entities/colorProduct.entity';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';
import { instanceToPlain } from 'class-transformer';
import { TenantConnectionService } from 'src/common/tenant-connection/tenant-connection.service';
import { InjectTenantRepository } from 'src/common/typeorm-tenant-repository/tenant-repository.decorator';

@Injectable()
export class ColorService {
  constructor(
    @InjectTenantRepository(Color)
    private readonly colorRepository: Repository<Color>,
  ) {}

  async create(createDto: CreateColorDto) {
    const exists = await this.colorRepository.findOneBy({
      color: createDto.color.trim(),
    });
    if (exists) {
      throw new BadRequestException(
        `Color '${createDto.color}' already exists`,
      );
    }

    const color = this.colorRepository.create(createDto);
    const saved = await this.colorRepository.save(color);
    return instanceToPlain(saved);
  }

  async findAll() {
    const data = await this.colorRepository.find();
    return instanceToPlain(data);
  }

  async findOne(id: string) {
    const color = await this.colorRepository.findOne({ where: { id } });
    if (!color) throw new NotFoundException(`Color with id ${id} not found`);
    return instanceToPlain(color);
  }

  async update(id: string, updateDto: UpdateColorDto) {
    const color = await this.colorRepository.findOneBy({ id });
    if (!color) throw new NotFoundException(`Color with id ${id} not found`);

    const updated = this.colorRepository.merge(color, updateDto);
    const saved = await this.colorRepository.save(updated);
    return instanceToPlain(saved);
  }

  async remove(id: string) {
    const color = await this.colorRepository.findOneBy({ id });
    if (!color) throw new NotFoundException(`Color with id ${id} not found`);
    await this.colorRepository.update(id, { deleted_at: new Date() });
    return { message: `Color with id ${id} deleted successfully` };
  }
}
