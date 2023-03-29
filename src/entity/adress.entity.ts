import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Orders } from './order.entity';

@Entity()
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => Orders, (order) => order.address)
  orders: Orders[];

  @Column({ nullable: false })
  address: string;

  @Column({ type: 'real', nullable: false })
  long: number;

  @Column({ type: 'real', nullable: false })
  lat: number;

  constructor(address: string, long: number, lat: number) {
    this.address = address;
    this.lat = lat;
    this.long = long;
  }
}
