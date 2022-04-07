import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServicesEntity } from './entities/service.entity';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  create(@Body() createServiceDto: CreateServiceDto) :Promise<ServicesEntity>{
    return this.servicesService.create(createServiceDto);
  }

  @Get()
  findAll() : Promise<ServicesEntity[]>{
    return this.servicesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(+id, updateServiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.servicesService.remove(+id);
  }
  @Delete('soft/:id')
  async deleteService(
    @Param('id') id: number,
  ) {
    return this.servicesService.softDeleteService(+id);
  }
  @Get('recover/:id')
  async restoreService(
    @Param('id') id: number,
  ) {
    return await this.servicesService.restoreService(+id);
  }
}
