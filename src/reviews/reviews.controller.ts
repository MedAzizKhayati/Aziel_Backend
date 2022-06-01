import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { User } from 'src/user/decorators/user.param-decorater';
import { UserEntity } from 'src/user/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/user/guards/roles.guard';

@Controller('reviews')
@UseGuards(AuthGuard('jwt'))
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) { }

  @Post()
  create(
    @Body() createReviewDto: CreateReviewDto,
    @User() ower: UserEntity,
  ) {
    return this.reviewsService.create(createReviewDto, ower);
  }

  @Get()
  findAll() {
    return this.reviewsService.findAll();
  }

  @Get('service/:id/?:limit/?:page')
  findByServiceId(
    @Param('id') id: string,
    @Param('limit') limit: number,
    @Param('page') page: number,
  ) {
    return this.reviewsService.findByServiceId(id, +page, +limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewsService.update(id, updateReviewDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewsService.remove(id);
  }
}
