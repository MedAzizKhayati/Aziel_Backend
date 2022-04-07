import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServicesEntity } from './entities/service.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(ServicesEntity)
    private servicesRepository: Repository<ServicesEntity>
  ){}
  async create(createServiceDto: CreateServiceDto) :Promise<ServicesEntity> {
    const newService = this.servicesRepository.create();
    return await this.servicesRepository.save(newService);
  }

  async findAll() {
    return await this.servicesRepository.find();
  }

  async findOne(id: number):Promise<ServicesEntity>  {
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

  async update(id: number, updateServiceDto: UpdateServiceDto) {
    const newService = await this.servicesRepository.preload({
      id,
      ...updateServiceDto
    });
    if (!newService) {
      throw new NotFoundException(`Le service d'id ${id} n'existe pas`);
    }
    return newService;
  }

  async remove(id: number) {
    return await this.servicesRepository.delete(id);
  }
  async softDeleteService(id: number) {
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
  async restoreService(id: number) {
    const service = await this.servicesRepository.findOne({
      where: {
        id
      },
    });
    if (!service) {
      throw new NotFoundException('');
    }
    return this.servicesRepository.restore(id);

  }
}
