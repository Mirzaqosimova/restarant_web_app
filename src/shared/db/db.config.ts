import { DataSource } from 'typeorm';
import { Address } from '../../entity/adress.entity';
import { Category } from '../../entity/category.entity';
import { Orders } from '../../entity/order.entity';
import { Product } from '../../entity/product.entity';
import { User } from '../../entity/user.entity';
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
  entities: [Category, Orders, Product, Address, User],
  migrationsTableName: 'migrations',
  migrations: [CreateOrderPmig1679745435023],
});

export default AppDataSource;
