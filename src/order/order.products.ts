// import { Column, Entity, ManyToOne } from "typeorm"
// import { Product } from "../product/product.entity"
// import { Order } from "./order.entity"

// @Entity({synchronize: true})
// export class OrderProducts{

//     @ManyToOne(() => Order, order => order.order_products)
//     order: Order

//     @ManyToOne(() => Product, product => product.orders)
//     product: Product

//     @Column()
//     count: number

//     @Column()
//     price: number
// }
