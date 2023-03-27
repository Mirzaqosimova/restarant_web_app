import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from '../order/order.entity';
import { Language } from '../shared/enums/languages';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  chat_id: number;

  @Column()
  phone_number: string;

  @Column()
  full_name: string;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @Column({
    type: 'enum',
    enum: Language,
  })
  language: Language;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: string;
}
