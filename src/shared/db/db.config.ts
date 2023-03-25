import { DataSource } from 'typeorm';
import { Category } from '../../category/category.entity';
import { Order } from '../../order/order.entity';
import { Product } from '../../product/product.entity';
import { User } from '../../user/user.entity';
import { DB_NAME, DB_PASSWORD, DB_USER } from '../const';
import { CreateOrderPmig1679745435023 } from '../migration/1679745435023-CreateOrderPmig';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  synchronize: true,
  logging: false,
  entities: [Category, Order, Product,User],
  migrationsTableName: 'migrations',
  migrations: [CreateOrderPmig1679745435023]
});

export default AppDataSource;
