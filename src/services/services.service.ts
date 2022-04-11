import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRoleEnum } from 'src/enums/user-role.enum';
import { Repository } from 'typeorm';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServicesEntity } from './entities/service.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(ServicesEntity)
    private servicesRepository: Repository<ServicesEntity>
  ) { }
  async create(createServiceDto: CreateServiceDto): Promise<ServicesEntity> {
    const newService = this.servicesRepository.create(createServiceDto);
    //newService.user = user;
    return await this.servicesRepository.save(newService);
  }

  async findAll() {
    return await this.servicesRepository.find();
  }

  async findOne(id: string): Promise<ServicesEntity> {
    const service = await this.servicesRepository.findOne({
      where: {
        id
      },
    });
    if (!service) {
      throw new NotFoundException(`Le service d'id ${id} n'existe pas`);
    }
    return service;
  }

  async update(id: string, updateServiceDto: UpdateServiceDto) {
    const newService = await this.servicesRepository.preload({
      id,
      ...updateServiceDto
    });
    if (!newService) {
      throw new NotFoundException(`Le service d'id ${id} n'existe pas`);
    }
    return newService;
  }

  async remove(id: string) {
    return await this.servicesRepository.delete(id);
  }

  async softDeleteService(id: string) {
    const service = await this.servicesRepository.findOne({
      where: {
        id
      },
    });
    console.log('service', service);
    if (!service) {
      throw new NotFoundException('');
    }
    return this.servicesRepository.softDelete(id);
  }

  async restoreService(id: string) {
    const service = await this.servicesRepository.findOne({
      where: {
        id
      },
      withDeleted: true
    });
    if (!service) {
      throw new NotFoundException('');
    }
    return this.servicesRepository.restore(id);
  }

  async getCvs(user): Promise<ServicesEntity[]> {
    if (user.role === UserRoleEnum.ADMIN)
      return await this.servicesRepository.find();
    return await this.servicesRepository.find({ user });
  }
}
