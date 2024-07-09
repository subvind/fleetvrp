import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Manager } from './modules/owner/manager.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  stripeCustomerId: string;

  @OneToOne(() => Manager, manager => manager.user, { nullable: true })
  manager?: Manager;
}