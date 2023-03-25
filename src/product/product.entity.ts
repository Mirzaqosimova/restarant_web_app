import { Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm"
// import { OrderProducts } from "../order/order.products"

@Entity()
export class Product{

    @PrimaryGeneratedColumn()
    id: number

    // @OneToMany(() => OrderProducts, order => order.product)
    // orders: OrderProducts[]
    
    // @OneToMany(() => Basket, basket => basket.product)
    // baskets: Basket[]
    
    @Column()
    file_name: string

    @Column()
    name: string

    @Column()
    description: string

    @Column()
    price: number

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    created_at: string
}