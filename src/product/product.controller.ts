import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, HttpCode, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('/api/v1/product/')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('')
  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  create(@Req() req: any, @Body() createProductDto: CreateProductDto) {
    return this.productService.create(req, createProductDto);
  }

  @Get('')
  findAll(@Query() q: any) {
    return this.productService.findAll(q);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

  @Get('user/:id')
  findProductsByUser(@Param('id') id: string){
    return this.productService.findProductsByUser(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Req() req: any, @Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(+id, updateProductDto, req);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Req() req: any, @Param('id') id: string) {
    return this.productService.remove(req, +id);
  }
}
