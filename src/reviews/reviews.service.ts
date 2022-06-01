import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { query } from 'express';
import { round } from 'src/generics/helpers';
import { ServicesService } from 'src/services/services.service';
import { UserEntity } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    private userService: UserService,
    private serviceService: ServicesService,
  ) { }

  async create(
    createReviewDto: CreateReviewDto,
    ower: UserEntity,
  ) {
    const review = this.reviewsRepository.create(createReviewDto);
    review.owner = ower;
    const target = await this.userService.findOne(createReviewDto.targetId);
    if (!target) {
      throw new Error('Target user not found');
    }
    review.target = target;

    // Service can be null
    review.service = await this.serviceService.findOne(createReviewDto.serviceId);
    if (review.service) {
      await this.serviceService.addReview(review.service, review);
      await this.userService.incrementReviewsAsAseller(review.target, review);
    }
    else {
      await this.userService.incrementReviewsAsAbuyer(review.target, review);
    }
    return this.reviewsRepository.save(review);
  }

  findByCondition(condition: any, page: number = 1, limit: number = 10) {
    return this.reviewsRepository.find({
      where: condition,
      skip: limit * (page - 1),
      take: limit,
    });
  }

  async findByServiceId(serviceId: string, page: number = 1, limit: number = 10) {
    const reviews = await this.findByCondition({ service: { id: serviceId } }, page, limit);
    console.log(page);
    return reviews;
  }

  findAll() {
    return this.reviewsRepository.find();
  }

  findOne(id: string) {
    return this.reviewsRepository.findOne(id);
  }

  update(id: string, updateReviewDto: UpdateReviewDto) {
    return `This action updates a #${id} review`;
  }

  async remove(id: string) {
    const review = await this.reviewsRepository.findOne(id);
    if (!review)
      throw new Error('Review not found');

    if (review.service) {
      await this.userService.decrementReviewsAsAseller(review.target, review);
      await this.serviceService.removeReview(review.service, review);
    }
    else
      await this.userService.decrementReviewsAsAbuyer(review.target, review);

    return await this.reviewsRepository.delete(id);
  }

  deleteByContition(condition: any) {
    return this.reviewsRepository.delete(condition);
  }
}
