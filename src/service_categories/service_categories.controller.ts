import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { ServiceCategoriesService } from './service_categories.service';
import { CreateServiceCategoryDto } from './dto/create-service_category.dto';
import { UpdateServiceCategoryDto } from './dto/update-service_category.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { editFileName, imageFileFilter } from 'src/generics/helpers';
import { diskStorage } from 'multer';
import { RolesGuard } from 'src/user/guards/roles.guard';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('service-categories')
export class ServiceCategoriesController {
  constructor(private readonly serviceCategoriesService: ServiceCategoriesService) { }

  @Post()
  create(@Body() createServiceCategoryDto: CreateServiceCategoryDto) {
    return this.serviceCategoriesService.create(createServiceCategoryDto);
  }

  @Get()
  findAll() {
    return this.serviceCategoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceCategoriesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateServiceCategoryDto: UpdateServiceCategoryDto) {
    return this.serviceCategoriesService.update(id, updateServiceCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serviceCategoriesService.remove(id);
  }

  @Post('upload-image/:id')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './public/static/service-categories',
      filename: editFileName,
    }),
    fileFilter: imageFileFilter,
    limits: {
      fileSize: 4_000_000, // 4MB
    }
  }))
  uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
  ) {
    return this.serviceCategoriesService.uploadImage(file, id);
  }

}
