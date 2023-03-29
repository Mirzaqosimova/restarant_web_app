import { Any, Not } from 'typeorm';
import { Product } from '../entity/product.entity';
import AppDataSource from '../shared/db/db.config';
import { ApiResponse } from '../shared/response/base.response';
import { CategoryService } from './category-service';

export class ProductService {
  private static instance = new ProductService();
  private categoryService = CategoryService.getInstance();

  public static getInstance() {
    return this.instance;
  }
  private productRepository = AppDataSource.getRepository(Product);

  async create(payload, res): Promise<void> {
    const [data, category] = await Promise.all([
      this.productRepository.findOneBy({ name: payload.name }),
      this.categoryService.findOne(payload.categoryId),
    ]);
    if (data !== null) {
      return res.json(ApiResponse.Conflict('Name already exists'));
    }
    if (category === null) {
      return res.json(ApiResponse.Conflict('Category not found'));
    }
    await this.productRepository
      .save({
        name: payload.name,
        file_name: payload.fileName,
        description: payload.description,
        price: payload.price,
        is_active: payload.isActive,
        category: category,
      })
      .then((data) => {
        return res.json(ApiResponse.Success(data));
      })
      .catch((err) => res.json(err));
  }

  findAll(query, res) {
    const queryData = {
      relations: {
        products: true,
      },
      where: {
        id: query.categoryId,
      },
    };
    if (query.isActive) {
      queryData.where['products'] = { is_active: query.isActive };
    }

    return this.categoryService
      .findOne(1, queryData)
      .then((data) => res.json(ApiResponse.Success(data)))
      .catch((err) => res.json(err));
  }

  findOne({ id }, res) {
    return this.productRepository
      .findOne({
        relations: {
          category: true,
        },
        where: {
          id,
        },
      })
      .then((data) => res.json(ApiResponse.Success(data)))
      .catch((err) => res.json(err));
  }
  async edit(payload, res) {
    const [data, category] = await Promise.all([
      this.productRepository.findOneBy({
        name: payload.name,
        id: Not(payload.id),
      }),
      this.categoryService.findOne(payload.categoryId),
    ]);
    if (data !== null) {
      return res.json(ApiResponse.Conflict('Name already exists'));
    }
    if (category === null) {
      return res.json(ApiResponse.Conflict('Category not found'));
    }
    await this.productRepository
      .update(
        { id: payload.id },
        {
          name: payload.name,
          file_name: payload.fileName,
          description: payload.description,
          price: payload.price,
          is_active: payload.isActive,
          category: category,
        },
      )
      .then((data) => {
        return res.json(ApiResponse.Success(data));
      })
      .catch((err) => res.json(err));
  }
  async findAndValidateIds(ids: number[], res) {
    const data = await this.productRepository.find({
      select: {
        id: true,
        price: true,
      },
      where: { id: Any(ids) },
    });

    if (ids.length !== data.length) {
      return res.json(ApiResponse.NotFound('Some products not found'));
    }
    return data;
  }
  delete({ id }, res) {
    return this.productRepository
      .delete({ id })
      .then((data) => {
        return res.json(ApiResponse.Success(data));
      })
      .catch((err) => res.json(err));
  }
}
