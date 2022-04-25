import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { ServicesEntity } from './entities/service.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceCategoriesModule } from 'src/service_categories/service_categories.module';
import { Review } from 'src/reviews/entities/review.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServicesEntity, Review]),
    ServiceCategoriesModule,
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService]
})
export class ServicesModule { }
