import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Language } from '../shared/enums/languages';
import { Orders } from './order.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  chat_id: number;

  @Column({ nullable: false })
  phone_number: string;

  @Column({ nullable: false })
  full_name: string;

  @OneToMany(() => Orders, (order) => order.user)
  orders: Orders[];

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
