import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isNumber } from 'class-validator';
import { round } from 'src/generics/helpers';
import { Review } from 'src/reviews/entities/review.entity';
import { ServiceCategoriesService } from 'src/service_categories/service_categories.service';
import { UserEntity } from 'src/user/entities/user.entity';
import { UserRoleEnum } from 'src/user/enums/user-role.enum';
import { Repository } from 'typeorm';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServicesEntity } from './entities/service.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(ServicesEntity)
    private servicesRepository: Repository<ServicesEntity>,
    private serviceCategoriesRepository: ServiceCategoriesService,
  ) { }
  async create(createServiceDto: CreateServiceDto, user: UserEntity): Promise<ServicesEntity> {
    const newService = this.servicesRepository.create({ ...createServiceDto, user });
    newService.category =
      createServiceDto.categoryId ?
        await this.serviceCategoriesRepository.findOne(createServiceDto.categoryId) :
        null;
    return await this.servicesRepository.save(newService);
  }

  async findByCategory(categoryId: string): Promise<ServicesEntity[]> {
    return await this.servicesRepository.find({
      where: { category: { id: categoryId } },
    });
  }

  async findByUser(userId: string): Promise<ServicesEntity[]> {
    return await this.servicesRepository.find({
      where: { user: { id: userId } },
    });
  }

  async findPopular(take: number = 10) {
    if(!take || !isNumber(take) || take < 0)
      take = 10;
      
    return await this.servicesRepository.find({
      order: {
        reviewsCount: 'DESC',
      },
      take,
    });
  }

  async findAll() {
    return this.servicesRepository.find();
  }

  async findOne(id: string): Promise<ServicesEntity> {
    const service = await this.servicesRepository.findOne(id);
    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
    return service;
  }

  async update(id: string, updateServiceDto: UpdateServiceDto) {
    const newService = await this.servicesRepository.preload({
      id,
      ...updateServiceDto
    });
    if (!newService) {
      throw new NotFoundException(`Service with ID ${id} not found`);
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

  async getCvs(user: UserEntity): Promise<ServicesEntity[]> {
    if (user.role === UserRoleEnum.ADMIN)
      return await this.servicesRepository.find();
    return await this.servicesRepository.find({ user });
  }

  async uploadImage(file: Express.Multer.File, id: string) {
    const imagePath = file.path.replace('public', '').split('\\').join('/');
    const status = await this.servicesRepository.update(id, { imagePath });
    if (!status.affected) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
    return status;
  }

  addReview(service: ServicesEntity, review: Review) {
    delete service.user;
    service.rating = round((service.rating * service.reviewsCount++ + review.rating) / service.reviewsCount);
    return this.servicesRepository.save(service);
  }


  removeReview(service: ServicesEntity, review: Review) {
    if (service.reviewsCount > 1)
      service.rating = round((service.rating * service.reviewsCount-- - review.rating) / service.reviewsCount);
    else {
      service.rating = 0;
      service.reviewsCount = 0;
    }
    return this.servicesRepository.save(service);
  }

}
