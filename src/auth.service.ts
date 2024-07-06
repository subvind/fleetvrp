import { Injectable, ConflictException } from '@nestjs/common';
import { User } from './user.model';
import * as bcrypt from 'bcrypt';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private users: User[] = [];
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined in the environment variables');
    }
    this.stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' });
  }

  async register(email: string, password: string): Promise<User> {
    // Check if user already exists
    const existingUser = this.users.find(u => u.email === email);
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

    const newUser: User = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      stripeCustomerId,
    };

    this.users.push(newUser);
    console.log('User registered:', newUser.email);
    return newUser;
  }

  async login(email: string, password: string): Promise<User | null> {
    const user = this.users.find(u => u.email === email);
    if (user && await bcrypt.compare(password, user.password)) {
      console.log('User logged in:', user.email);
      return user;
    }
    return null;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }
}