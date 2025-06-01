import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly repository: Repository<Category>
  ){}
  async create(createCategoryDto: CreateCategoryDto) {
    try{
      const category_entity = this.repository.create(createCategoryDto);

      const category = await this.repository.save(category_entity);

      return {
        status: 'success',
        data: category
      }
    }catch(e){
      throw e;
    }
  }

  async findAll() {
    try{
     const categories = await this.repository.find();
     
     return {
      status: 'success',
      data: categories
     }
    }catch(err){
      throw err;
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
