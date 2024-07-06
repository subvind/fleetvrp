import { Injectable, ConflictException } from '@nestjs/common';
import { User } from './user.model';
import * as bcrypt from 'bcrypt';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AuthService {
  private users: User[] = [];
  private stripe: Stripe;
  private readonly usersFilePath: string;

  constructor(private configService: ConfigService) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined in the environment variables');
    }
    this.stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' });
    
    // Set up file storage for users
    this.usersFilePath = path.join(__dirname, '../data', 'users.json');
    this.loadUsers();
  }

  loadUsers() {
    try {
      if (fs.existsSync(this.usersFilePath)) {
        const data = fs.readFileSync(this.usersFilePath, 'utf8');
        this.users = JSON.parse(data);
        console.log('Users loaded from file');
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  saveUsers() {
    try {
      fs.writeFileSync(this.usersFilePath, JSON.stringify(this.users, null, 2));
      console.log('Users saved to file');
    } catch (error) {
      console.error('Error saving users:', error);
    }
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
    this.saveUsers();
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
    console.log('Getting user with id:', id);
    const user = this.users.find(u => u.id === id);
    console.log('Found user:', user);
    return user;
  }
}