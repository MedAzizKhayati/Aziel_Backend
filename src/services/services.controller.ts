import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServicesEntity } from './entities/service.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName, imageFileFilter } from 'src/generics/helpers';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/user/guards/roles.guard';
import { Roles } from 'src/user/decorators/roles.metadata';
import { UserRoleEnum } from 'src/user/enums/user-role.enum';
import { User } from 'src/user/decorators/user.param-decorater';
import { UserEntity } from 'src/user/entities/user.entity';

@Controller('services')
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) { }

  @Post()
  create(
    @Body() createServiceDto: CreateServiceDto,
    @User() user: UserEntity
  ): Promise<ServicesEntity> {
    return this.servicesService.create(createServiceDto, user);
  }

  @Post('recover/:id')
  @Roles(UserRoleEnum.ADMIN)
  async restoreService(
    @Param('id') id: string,
  ) {
    return await this.servicesService.restoreService(id);
  }

  @Get()
  findAll(): Promise<ServicesEntity[]> {
    return this.servicesService.findAll();
  }

  @Get('popular/:limit')
  async getPopularServices(
    @Param('limit') limit: number,
  ) {
    return await this.servicesService.findPopular(+limit);
  }

  @Get('category/:id')
  findByCategory(
    @Param('id') id: string
  ): Promise<ServicesEntity[]> {
    return this.servicesService.findByCategory(id);
  }

  @Get('user/:id')
  findByUser(
    @Param('id') id: string,
  ): Promise<ServicesEntity[]> {
    return this.servicesService.findByUser(id);
  }


  @Get(':id')
  findOne(@Param('id') id: string): Promise<ServicesEntity> {
    return this.servicesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(id, updateServiceDto);
  }

  @Delete(':id')
  @Roles(UserRoleEnum.ADMIN)
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }

  @Delete('soft/:id')
  async deleteService(
    @Param('id') id: string,
  ) {
    return this.servicesService.softDeleteService(id);
  }

  @Post('upload-image/:id')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './public/uploads/services',
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
    return this.servicesService.uploadImage(file, id);
  }
}
