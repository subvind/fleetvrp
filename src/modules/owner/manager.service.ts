import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Manager } from './manager.entity';
import { User } from '../../user.model'; // Adjust the import path as needed

@Injectable()
export class ManagerService {
  constructor(
    @InjectRepository(Manager)
    private managerRepository: Repository<Manager>,
  ) {}

  async findAll(search?: string, page: number = 1, limit: number = 20): Promise<{ managers: Manager[], total: number }> {
    const query = this.managerRepository.createQueryBuilder('manager')
      .leftJoinAndSelect('manager.user', 'user');

    if (search) {
      query.where('manager.name LIKE :search OR user.email LIKE :search', { search: `%${search}%` });
    }

    const total = await query.getCount();

    query.skip((page - 1) * limit).take(limit);

    const managers = await query.getMany();

    return { managers, total };
  }

  async create(managerData: { name: string, userId: string }): Promise<Manager> {
    const manager = this.managerRepository.create({
      name: managerData.name,
      user: { id: managerData.userId } as User
    });
    return this.managerRepository.save(manager);
  }

  async findOne(id: string): Promise<Manager> {
    return this.managerRepository.findOne({ where: { id }, relations: ['user'] });
  }

  async update(id: string, managerData: { name?: string, userId?: string }): Promise<Manager> {
    const manager = await this.managerRepository.findOne({ where: { id } });
    if (!manager) {
      throw new Error('Manager not found');
    }

    if (managerData.name) {
      manager.name = managerData.name;
    }
    if (managerData.userId) {
      manager.user = { id: managerData.userId } as User;
    }

    return this.managerRepository.save(manager);
  }

  async remove(id: string): Promise<void> {
    await this.managerRepository.delete(id);
  }
}