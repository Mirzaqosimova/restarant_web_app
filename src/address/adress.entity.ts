import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from '../order/order.entity';
import { User } from '../user/user.entity';

@Entity()
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => Order, (order) => order.adress)
  order: Order[];

  @ManyToOne(() => User, (user) => user.address)
  users: User;

  @Column()
  address: string;

  @Column({ type: 'real' })
  long: number;

  @Column({ type: 'real' })
  lat: number;

  constructor(user: User, address: string, long: number, lat: number) {
    this.users = user;
    this.address = address;
    this.lat = lat;
    this.long = long;
  }
}
