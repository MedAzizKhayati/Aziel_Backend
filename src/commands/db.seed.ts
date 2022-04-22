import { NestFactory } from '@nestjs/core';
import { ServicesService } from 'src/services/services.service';
import { ServiceCategoriesService } from 'src/service_categories/service_categories.service';
import { ReviewsService } from 'src/reviews/reviews.service';
import { CreateServiceDto } from 'src/services/dto/create-service.dto';
import { CreateReviewDto } from 'src/reviews/dto/create-review.dto';

import * as casual from 'casual';
import { AppModule } from 'src/app.module';
import { UserService } from '../user/user.service';
import { CreateServiceCategoryDto } from 'src/service_categories/dto/create-service_category.dto';


async function bootstrap() {
    console.log('In db seed....');
    const app = await NestFactory.createApplicationContext(AppModule);
    console.log('App Module loaded successfully....');

    const servicesService = app.get(ServicesService);
    console.log('ServicesService Loaded Successfully....');

    const userService = await app.resolve(UserService);
    console.log('UserService Loaded Successfully....');

    const serviceCategoryService = app.get(ServiceCategoriesService);
    console.log('ServiceCategoryService Loaded Successfully....');

    const reviewsService = await app.resolve(ReviewsService);
    console.log('ReviewsService Loaded Successfully....');

    const users = await userService.findAll();
    console.log('Users Loaded Successfully....');

    // Seed categories
    for (let i = 1; i < 5; i++) {
        const category = new CreateServiceCategoryDto();
        category.title = casual.title;
        category.description = casual.description;
        await serviceCategoryService.create(category);
    }
    
    const categories = await serviceCategoryService.findAll();
    console.log('Categories Loaded Successfully....'); 

    // Seed Services.
    for (let i = 1; i < 50; i++) {
        const service = new CreateServiceDto();
        const user = users[casual.integer(0, users.length - 1)];
        service.title = casual.title;
        service.description = casual.description;
        service.price = casual.integer(10, 500);
        service.categoryId = categories[casual.integer(0, categories.length - 1)].id;
        await servicesService.create(service, user);
    }
    const services = await servicesService.findAll();

    console.log('Services seeded successfully....');


    // Seed reviews
    for (let i = 1; i < 500; i++) {
        const review = new CreateReviewDto();
        const service = services[casual.integer(0, services.length - 1)];
        review.rating = casual.integer(9, 10) / 2;
        review.comment = casual.description;
        review.serviceId = service.id;
        review.targetId = service.user.id;
        let owner = users[casual.integer(0, users.length - 1)];
        while (owner.id == service.user.id)
            owner = users[casual.integer(0, users.length - 1)];
        await reviewsService.create(review, owner);
    }
    
    // const reviews = await reviewsService.findAll();
    // for(const review of reviews){
    //     await reviewsService.remove(review.id);
    // }

    console.log('Reviews seeded successfully....');
    
    await app.close();
}

bootstrap();