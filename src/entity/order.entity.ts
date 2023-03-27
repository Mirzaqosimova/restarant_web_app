import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Address } from './adress.entity';
import { OrderStatus } from '../shared/enums/order.status';
import { PaymentType } from '../shared/enums/payment.type';
import { User } from './user.entity';
//import { OrderProducts } from "./order.products";

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Address, (address) => address.orders)
  adress: Address;

  //   @OneToMany(() => OrderProducts, order_products => order_products.order)
  //   order_products: OrderProducts[];

  @Column()
  phone_number: string;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: PaymentType,
  })
  payment_type: PaymentType;

  @Column({
    type: 'enum',
    enum: OrderStatus,
  })
  status: OrderStatus;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: string;
}
