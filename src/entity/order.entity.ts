import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Address } from './adress.entity';
import { OrderStatus } from '../shared/enums/order.status';
import { PaymentType } from '../shared/enums/payment.type';
import { User } from './user.entity';

@Entity('orders')
export class Orders {
  @PrimaryGeneratedColumn()
  id: number;

  @JoinColumn({ name: 'address_id' })
  @ManyToOne(() => Address, (address) => address.orders)
  address: Address;
 
  @JoinColumn({ name: 'user_id' })
  @ManyToOne(() => User, (user) => user.orders)
  user: User;

  @Column({ nullable: false })
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
