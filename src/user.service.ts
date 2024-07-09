import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.model';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async findAll(): Promise<User[]> {
    let users = await this.cacheManager.get<User[]>('users');
    if (!users) {
      users = await this.userRepository.find();
      await this.cacheManager.set('users', users);
    }
    return users;
  }

  async findOne(id: string): Promise<User | undefined> {
    const users = await this.findAll();
    return users.find(u => u.id === id);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const users = await this.findAll();
    return users.find(u => u.email === email);
  }
}