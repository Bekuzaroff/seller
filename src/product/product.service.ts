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

  async findAll(q: any) {
    try{
      let products = await this.repository.find({relations: ['user']});

      if(q.name){
        products = products.filter(v => v.name.includes(q.name));
      }
      if(q.description){
        products = products.filter(v => v.description.includes(q.description));
      }
      if(q.is_new){
        products = products.filter(v => v.is_new === q.is_new);
      }
      if(q.start_price){
        products = products.filter(v => v.price >= q.start_price);
      }
      if(q.end_price){
        products = products.filter(v => v.price <= q.end_price);
      }

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

  async remove(req: any, id: number) {
    try{
      console.log(req.user)
      if(!id){
        throw new HttpException('id is not provided', 400);
      }

      const product = await this.repository.findOne({
        where: {product_id: id},
        relations: ['user']
      });

      if(!product){
        throw new HttpException('no product with such id', 404);
      }

      if(product.user.user_id !== req.user.user_id){
        throw new HttpException('can only delete your products', 400);
      }

      await this.repository.delete({product_id: id});

      return {
        status: 'success',
        data: product
      }
    }catch(err){
      throw err;
    }
  }
}
