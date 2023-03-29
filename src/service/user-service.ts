import { User } from '../entity/user.entity';
import AppDataSource from '../shared/db/db.config';

export class UserService {
  private static instance = new UserService();

  public static getInstance() {
    return this.instance;
  }
  private userRepository = AppDataSource.getRepository(User);
  findOne(id: number) {
    return this.userRepository.findOneBy({ id });
  }
}
