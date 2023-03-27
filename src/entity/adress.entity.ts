import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { User } from './user.entity';

@Entity()
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => Order, (order) => order.adress)
  orders: Order[];

  @ManyToOne(() => User, (user) => user.addresses)
  user: User;

  @Column()
  address: string;

  @Column({ type: 'real' })
  long: number;

  @Column({ type: 'real' })
  lat: number;

  constructor(user: User, address: string, long: number, lat: number) {
    this.user = user;
    this.address = address;
    this.lat = lat;
    this.long = long;
  }
}
