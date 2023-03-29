import { Address } from '../entity/adress.entity';
import AppDataSource from '../shared/db/db.config';

export class AddressService {
  private static instance = new AddressService();

  public static getInstance() {
    return this.instance;
  }
  private addressRepository = AppDataSource.getRepository(Address);

  create(address: Address) {
    return this.addressRepository.save(address);
  }

  findOneBy(by) {
    return this.addressRepository.findOneBy(by);
  }

  findForBot(id) {
    return this.addressRepository
      .createQueryBuilder('address')
      .select(['address.address'])
      .innerJoin('address.order', 'orders')
      .innerJoin('orders.user', 'users')
      .distinct(true)
      .where('users.chat_id = :id', { id })
      .take(10)
      .getRawMany();
  }
}
