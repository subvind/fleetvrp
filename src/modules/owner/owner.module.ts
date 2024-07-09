import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OwnerController } from './owner.controller';
import { ManagerService } from './manager.service';
import { Manager } from './manager.entity';
import { UserService } from '../../user.service'; // We'll create this next
import { User } from '../../user.model';

@Module({
  imports: [TypeOrmModule.forFeature([Manager, User])],
  controllers: [OwnerController],
  providers: [ManagerService, UserService],
})
export class OwnerModule {}