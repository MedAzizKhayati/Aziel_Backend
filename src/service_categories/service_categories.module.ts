import { Module } from '@nestjs/common';
import { ServiceCategoriesService } from './service_categories.service';
import { ServiceCategoriesController } from './service_categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceCategory } from './entities/service_category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceCategory])
  ],
  controllers: [ServiceCategoriesController],
  providers: [ServiceCategoriesService],
  exports: [ServiceCategoriesService]
})
export class ServiceCategoriesModule { }
