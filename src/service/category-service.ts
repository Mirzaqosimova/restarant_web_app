import { Not } from 'typeorm';
import { Category } from '../entity/category.entity';
import AppDataSource from '../shared/db/db.config';
import { ApiResponse } from '../shared/response/base.response';

export class CategoryService {
  private static instance = new CategoryService();

  public static getInstance() {
    return this.instance;
  }
  private categoryRepository = AppDataSource.getRepository(Category);

  async create(payload, res) {
    const data = await this.categoryRepository.findOneBy({
      name: payload.name,
    });
    if (data != null) {
      return res.json(ApiResponse.Conflict('Name already exists'));
    }
    await this.categoryRepository
      .save({ name: payload.name, file_name: payload.fileName })
      .then((data) => {
        return res.json(ApiResponse.Success(data));
      })
      .catch((err) => res.json(err));
  }

  async findAll(res) {
    return this.categoryRepository
      .find()
      .then((data) => res.json(ApiResponse.Success(data)))
      .catch((err) => res.json(err));
  }

  async findOne(id: number, query?: any) {
    if (!query) {
      return this.categoryRepository.findOne({
        relations: {
          products: true,
        },
        where: {
          id,
        },
      });
    } else {
      return this.categoryRepository.findOne(query);
    }
  }

  async edit(payload, res) {
    const data = await this.categoryRepository.findOneBy({
      name: payload.name,
      id: Not(payload.id),
    });
    if (data != null) {
      return res.json(ApiResponse.Conflict('Name already exists'));
    }
    await this.categoryRepository
      .update(
        { id: payload.id },
        { name: payload.name, file_name: payload.fileName },
      )
      .then((data) => {
        return res.json(ApiResponse.Success(data));
      })
      .catch((err) => res.json(err));
  }
  async delete(payload, res) {
    const data = await this.findOne(payload.id);
    if (data === null) {
      return res.json(ApiResponse.NotFound('Category not found'));
    }
    if (data.products.length !== 0) {
      return res.json(
        ApiResponse.Conflict(
          'This category have products please delete first them',
        ),
      );
    }
    return this.categoryRepository
      .delete({ id: payload.id })
      .then((data) => {
        return res.json(ApiResponse.Success(data));
      })
      .catch((err) => res.json(err));
  }
}
