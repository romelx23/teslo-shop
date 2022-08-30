import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
  constructor(private readonly productService: ProductsService) {}
  async runSeed() {
    await this.insertNewProducts();
    return 'seed execute';
  }
  private async insertNewProducts() {
    await this.productService.deleteAllProducts();
    const products = initialData.products;
    const inserPromises = [];
    products.forEach((product) => {
      inserPromises.push(this.productService.create(product));
    });
    const results = await Promise.all(inserPromises);
    return true;
  }
}
