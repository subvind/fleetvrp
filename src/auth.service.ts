import { Injectable, ConflictException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.model';
import * as bcrypt from 'bcrypt';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class AuthService {
  private users: User[] = [];
  private stripe: Stripe;
  private readonly usersFilePath: string;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined in the environment variables');
    }
    this.stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' });
  }
  

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null;
  }

  async register(email: string, password: string): Promise<User> {
    let users = await this.cacheManager.get<User[]>('users') || [];
    console.log(users)

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let stripeCustomerId: string;

    try {
      // Check if customer already exists in Stripe
      const existingCustomers = await this.stripe.customers.list({ email: email, limit: 1 });
      
      if (existingCustomers.data.length > 0) {
        // Customer already exists, use the existing customer ID
        stripeCustomerId = existingCustomers.data[0].id;
        console.log(`Using existing Stripe customer: ${stripeCustomerId}`);
      } else {
        // Customer doesn't exist, create a new one
        const newCustomer = await this.stripe.customers.create({ email });
        stripeCustomerId = newCustomer.id;
        console.log(`Created new Stripe customer: ${stripeCustomerId}`);
      }
    } catch (error) {
      console.error('Error with Stripe operation:', error);
      throw new Error('Failed to process Stripe customer');
    }

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      stripeCustomerId,
    // manager is not set initially, it will be undefined
    });

    let newUser = await this.userRepository.save(user);

    console.log('User registered:', newUser.email);
    return newUser;
  }

  async login(email: string, password: string): Promise<User | null> {
    return this.validateUser(email, password);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { id } });
  }
}