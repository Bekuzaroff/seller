import { HttpException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/auth/entities/user.entity';
import Red from '../redis/red';

@Injectable()
export class ProductService {

  constructor(
    @InjectRepository(Product)
    private readonly repository: Repository<Product>,
    @InjectRepository(UserEntity)
    private readonly user_repository: Repository<UserEntity>){
      
    }
  

    async create(req: any, createProductDto: CreateProductDto) {
    try{
      const redis = Red.getInstance();
      let product: any;

      product = {...createProductDto, user: req.user};
      product = this.repository.create(product);

      const saved_product = await this.repository.save(product);
      const redis_key = `user_id:${req.user.user_id}:product_id:${saved_product.product_id}`;

      await redis.set(redis_key, JSON.stringify(saved_product)); 
      await redis.rpush(`user_id:${req.user.user_id}:product_keys`, redis_key);
      
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
      // we create instance in another 
      // file with singleton pattern so the instance will be only one

      // caching logic ------
      const redis = Red.getInstance();

      let products: Product[];

      const keys = await redis.lrange('all_product_keys', 0, -1);

      if(keys.length > 0){
        const values = await redis.mget(...keys);
        products = values.map(v => JSON.parse(v!));

        return products;
      }
      // --------------

      //db logic ------
      products = await this.repository.find({relations: ['user'], order: {created_at: 'DESC'}});

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

      products.forEach( async(v) => {
        const product_key = `all_product_keys:${v.product_id}`;

        await redis.set(product_key, JSON.stringify(v));
        await redis.rpush('all_product_keys', product_key);
      })
      

      return {
        status: 'success',
        data: products
      }
    }catch(err){
      throw err;
    }
  }
    async findProductsByUser(id: number){
    try{
      const redis = Red.getInstance();
      let users_products: Product[];

      const keys = await redis.lrange(`user_id:${id}:product_keys`, 0, -1);

      if(keys.length > 0){
        const values = await redis.mget(...keys);
        users_products = values.map(v => JSON.parse(v!));
        
        return users_products;
      }

      users_products = await this.repository.find({
        where: {user: {user_id: id}}
      });

      if(users_products.length === 0){
        return {
          status: 'success',
          data: 'user does not have any products yet'
        }
      }

      return {
          status: 'success',
          data: users_products
        }
    }catch(err){
      throw err;
    }
  }

    async findOne(id: number) {
    try{
      const redis = Red.getInstance();
      let product: Product | null

      const keys = await redis.lrange('all_product_keys', 0, -1);

      if(keys.length > 0){
        const key = keys.find(v => v === `all_product_keys:${id}`);
        if(!key){
          throw new HttpException('no such product', 404);
        }

        const value = await redis.get(key);
        product = JSON.parse(value!);
      }

      product = await this.repository.findOne({ relations: ['user'], 
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

    async updateProduct(id: number, updateProductDto: UpdateProductDto, req: any) {
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

    async removeProduct(req: any, id: number) {
    try{
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

    async likeProduct(req: any, id: number){
    try{
      const product = await this.repository.findOne({where: {product_id: id}, relations: ['users_liked', 'user']});

      if(!product){
        throw new HttpException('product not found', 404);
      }

      if(product.user.user_id === req.user.user_id){
        return {};
      }
      
      req.user.liked_products.push(product);
      await this.user_repository.save(req.user);

      return {
        status: 'success',
        data: product
      }
    }catch(err){
      throw err;
    }
  }

    async get_user_liked_products(req: any){
    try{
      const user = await this.user_repository.findOne({where: {user_id: req.user.user_id}, 
      relations: ['liked_products']});

      if(!user){
        throw new HttpException('user not found', 404)
      }

      return {status: 'success', data: user.liked_products}

    }catch(err){
    throw err;
  }
  }

    async delete_user_liked_product(req: any, id: number){
    try{
      const product = await this.repository.findOne({where: {product_id: id}, relations: ['users_liked']});

      if(!product){
        throw new HttpException('product not found', 404);
      }

      const likes = req.user.liked_products
      
      for(let i = 0; i < likes.length; i++){
        if(likes[i].product_id == id){
          likes.splice(i, 1);
        }
      };
      await this.user_repository.save(req.user);

      return {
        status: 'success',
        data: product
      }
    }catch(err){
      throw err;
    }
  }

  


}
