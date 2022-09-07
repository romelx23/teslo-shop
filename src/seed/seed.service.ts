import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { ProductsService } from 'src/products/products.service';
import { Repository } from 'typeorm';
import { initialData } from './data/seed-data';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  constructor(
    private readonly productService: ProductsService,
    @InjectRepository(User)
    private readonly userRepositry: Repository<User>,
  ) {}
  async runSeed() {
    await this.deleteTables();
    const adminUser = await this.insertNewUsers();
    await this.insertNewProducts(adminUser);
    return 'seed execute';
  }

  private async deleteTables() {
    await this.productService.deleteAllProducts();
    const queryBuilder = this.userRepositry.createQueryBuilder();
    await queryBuilder.delete().where({}).execute();
  }

  private async insertNewUsers() {
    const seedUsers = initialData.users;
    const users: User[] = [];
    seedUsers.forEach((user) => {
      users.push(
        this.userRepositry.create({
          ...user,
          password: bcrypt.hashSync(user.password, 10),
        }),
      );
    });
    // console.log(seedUsers);
    const dbUsers = await this.userRepositry.save(users);
    return dbUsers[0];
  }

  private async insertNewProducts(user: User) {
    await this.productService.deleteAllProducts();
    const products = initialData.products;
    const inserPromises = [];
    products.forEach((product) => {
      inserPromises.push(this.productService.create(product, user));
    });
    const results = await Promise.all(inserPromises);
    return true;
  }
}
