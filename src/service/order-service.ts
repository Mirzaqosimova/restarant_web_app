import { Orders } from '../entity/order.entity';
import AppDataSource from '../shared/db/db.config';
import { OrderStatus } from '../shared/enums/order.status';
import { ApiResponse } from '../shared/response/base.response';
import { AddressService } from './address-service';
import { CategoryService } from './category-service';
import { ProductService } from './product-service';
import { UserService } from './user-service';

export class OrderService {
  private static instance = new OrderService();

  public static getInstance() {
    return this.instance;
  }
  private productService = ProductService.getInstance();
  private userService = UserService.getInstance();
  private addressService = AddressService.getInstance();

  private orderRepository = AppDataSource.getRepository(Orders);

  async create(payload, res) {
    const product_ids: number[] = [];
    payload.products.map((item) => {
      product_ids.push(item.productId);
    });

    const data = {
      phone_number: payload.phoneNumber,
      description: payload.description,
      payment_type: payload.paymentType,
      status: OrderStatus.NOT_PAYED,
    };
    if (payload.addressId) {
      const address = await this.addressService.findOne(payload.addressId);
      if (address === null) {
        return res.json(ApiResponse.NotFound('Address not found'));
      }
      data['address'] = address;
    }
    const user = await this.userService.findOne(payload.userId);
    if (user === null) {
      return res.json(ApiResponse.NotFound('User not found'));
    }
    data['user'] = user;
    const products = await this.productService.findAndValidateIds(
      product_ids,
      res,
    );
    // const order = await this.orderRepository.save(data)
    //  const orderProducts= payload.products.map((item)=>({
    //     order_id:order.id,
    //     product_id:item.productId,
    //     count: item.count,
    //     price: products.filter((data)=> data.id === item.productId).map((pr)=>(pr.price * item.count))[0]
    //   }))

    // await this.orderRepository
    //   .createQueryBuilder()
    //   .insert()
    //   .into('order_products')
    //   .values(orderProducts)
    //   .execute()
    return this.findOne({ id: 1 }, res);
  }

  async findAll(query, res) {
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
    //qolda yoz
    const data = await this.orderRepository
      .createQueryBuilder('order')
      .select(['order'])
      .addSelect(
        "JSON_AGG(DISTINCT(jsonb_build_object('name',product.name,'count',o_product.count,'price',o_product.price)) as files",
      )
      .leftJoinAndSelect('address', 'address', 'address.id = order.addressId')
      .innerJoinAndSelect('users', 'user', 'user.id = order.userId')
      .innerJoin('order_products', 'o_product', 'o_product.order_id = order.id')
      .innerJoin('products', 'product', 'product.id = o_product.product_id')
      .addGroupBy('order.id');
    console.log(data);
  }

  async findOne({ id }, res) {
    console.log(id);
    
    //qolda
    try {
      const data = await this.orderRepository
      .query(`
      select jsonb_build_object('orders',orders.*,'users',users.*,'address',address.*,'products',
JSON_AGG(DISTINCT(jsonb_build_object('name',products.name,'count',o_product.count,'price',o_product.price)))) as data 
from orders
left join address on address.id = orders.address_id
inner join order_products o_product on o_product.order_id = orders.id
inner join users on users.id = orders.user_id
inner join products on products.id = o_product.product_id
where orders.id = ${id}
group by orders.id, users.id,address.id
`)
      // .createQueryBuilder()
      // .select("jsonb_build_object('orders', orders.*, 'users', users.*, 'address', address.*, 'products', JSON_AGG(DISTINCT(jsonb_build_object('name', products.name, 'count', o_product.count, 'price', o_product.price)) )) as data")
      // .from('orders', 'orders')
      // .leftJoin('address', 'address', 'address.id = orders.address_id')
      // .innerJoin('order_products', 'o_product', 'o_product.order_id = orders.id')
      // .innerJoin('users', 'users', 'users.id = orders.user_id')
      // .innerJoin('products', 'products', 'products.id = o_product.product_id')
      // .where('orders.id = :id', { id })
      // .groupBy('orders.id, users.id, address.id')
      // .getOne();
        console.log(data);
      return res.json(ApiResponse.Success(data));
      
      
    } catch (e) {
      res.json(e);
    }
  }

  async edit(payload, res) {
    await this.orderRepository
      .update(
        { id: payload.id },
        {
          status: payload.status,
        },
      )
      .then((data) => {
        return res.json(ApiResponse.Success(data));
      })
      .catch((err) => res.json(err));
  }

  delete({ id }, res) {
    return this.orderRepository
      .delete({ id })
      .then((data) => {
        return res.json(ApiResponse.Success(data));
      })
      .catch((err) => res.json(err));
  }
}
