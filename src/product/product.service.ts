import { HttpException, Injectable } from '@nestjs/common';
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

      product = {...createProductDto, user: req.user}
      console.log(product)
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

  async findAll() {
    try{
      const products = await this.repository.find({relations: ['user']});

      return {
        status: 'success',
        data: products
      }
    }catch(err){
      throw err;
    }
  }

  async findOne(id: number) {
    try{
      const product = await this.repository.findOne({ relations: ['user'], 
      where: {product_id: id}
      });

      if(!product){
        throw new HttpException('no product with such id', 404);
      }

      return {
        status: 'success',
        data: product
      }
    }catch(err){
      throw err;
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto, req: any) {
    try{
      if(!id){
        throw new HttpException('no id provided', 400);
      }

      const product = await this.repository.findOne({
        relations: ['user'],
        where: {product_id: id}
      });
      
      if(!product){
        throw new HttpException('no product with such id', 404);
      }

      if(product.user.user_id !== req.user.user_id){
        throw new HttpException('can only modify your products', 400);
      }
      
      await this.repository.update({product_id: id}, updateProductDto)

      return {
        status: 'success',
        data: 'updated successfully'
      }
    }catch(err){
      throw err;
    }
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
