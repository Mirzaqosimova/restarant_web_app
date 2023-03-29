import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Orders } from './order.entity';
import { User } from './user.entity';

@Entity()
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => Orders, (order) => order.address)
  orders: Orders[];

  @JoinColumn({ name: 'user_id' })
  @ManyToOne(() => User, (user) => user.address)
  users: User;

  @Column({ nullable: false })
  address: string;

  @Column({ type: 'real', nullable: false })
  long: number;

  @Column({ type: 'real', nullable: false })
  lat: number;

  constructor(address: string, long: number, lat: number, user: User) {
    this.address = address;
    this.lat = lat;
    this.long = long;
    this.users = user;
  }
}
