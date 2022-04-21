import { Test, TestingModule } from '@nestjs/testing';
import { ServiceCategoriesService } from './service_categories.service';

describe('ServiceCategoriesService', () => {
  let service: ServiceCategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServiceCategoriesService],
    }).compile();

    service = module.get<ServiceCategoriesService>(ServiceCategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
