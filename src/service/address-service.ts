import { Address } from '../entity/adress.entity';
import AppDataSource from '../shared/db/db.config';

export class AddressService {
  private static instance = new AddressService();

  public static getInstance() {
    return this.instance;
  }
  private addressRepository = AppDataSource.getRepository(Address);
  findOne(id: number) {
    return this.addressRepository.findOneBy({ id });
  }
}
