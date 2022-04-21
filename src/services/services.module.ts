import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { ServicesEntity } from './entities/service.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceCategoriesModule } from 'src/service_categories/service_categories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServicesEntity]),
    ServiceCategoriesModule
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService]
})
export class ServicesModule { }
