import { User } from '../entity/user.entity';
import AppDataSource from '../shared/db/db.config';

export class UserService {
  private static instance = new UserService();

  public static getInstance() {
    return this.instance;
  }
  private userRepository = AppDataSource.getRepository(User);

  async create(payload) {
    return this.userRepository.save({ ...payload });
  }

  async update(where, payload) {
    return this.userRepository.update(where, { ...payload });
  }

  findOneBy(by) {
    return this.userRepository.findOneBy(by);
  }
}
