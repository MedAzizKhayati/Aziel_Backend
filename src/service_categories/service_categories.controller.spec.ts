import { Test, TestingModule } from '@nestjs/testing';
import { ServiceCategoriesController } from './service_categories.controller';
import { ServiceCategoriesService } from './service_categories.service';

describe('ServiceCategoriesController', () => {
  let controller: ServiceCategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceCategoriesController],
      providers: [ServiceCategoriesService],
    }).compile();

    controller = module.get<ServiceCategoriesController>(ServiceCategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
