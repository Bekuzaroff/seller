import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProductService {

  constructor(
    @InjectRepository(Product)
    private readonly repository: Repository<Product>){

    }

  async create(req: any, createProductDto: CreateProductDto) {
    try{
      let product: any;

      product = {...createProductDto, user_id: req.user.user_id}
      product = this.repository.create(product)

      await this.repository.save(product);
      return {
        status: 'success',
        data: 'product created successfully'
      }
    }catch(err){
      throw err;
    }
  }

  findAll() {
    
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
