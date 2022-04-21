import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateServiceCategoryDto } from './dto/create-service_category.dto';
import { UpdateServiceCategoryDto } from './dto/update-service_category.dto';
import { ServiceCategory } from './entities/service_category.entity';

@Injectable()
export class ServiceCategoriesService {

  constructor(
    @InjectRepository(ServiceCategory)
    private readonly serviceCategoryRepository: Repository<ServiceCategory>,
  ) { }

  create(createServiceCategoryDto: CreateServiceCategoryDto) {
    const serviceCategory = this.serviceCategoryRepository.create(createServiceCategoryDto);
    return this.serviceCategoryRepository.save(serviceCategory);

  }

  findAll() {
    return this.serviceCategoryRepository.find();
  }

  findOne(id: string) {
    return this.serviceCategoryRepository.findOne(id);
  }

  async update(id: string, updateServiceCategoryDto: UpdateServiceCategoryDto) {
    const status = await this.serviceCategoryRepository.update(id, updateServiceCategoryDto);
    if(!status.affected) {
      throw new NotFoundException(`Service Category with ID ${id} not found`);
    }
    return status;
  }

  async uploadImage(file: Express.Multer.File, id: string) {
    const imagePath = file.path.replace('public', '').split('\\').join('/');
    const status = await this.serviceCategoryRepository.update(id, {imagePath});
    if(!status.affected) {
      throw new NotFoundException(`Service Category with ID ${id} not found`);
    }
    return status;
  }

  remove(id: string) {
    return this.serviceCategoryRepository.softDelete(id);
  }
}
