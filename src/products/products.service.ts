import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { validate as isUUID } from 'uuid';
import { ProductImage } from './entities';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');
  constructor(
    @InjectRepository(Product)
    private readonly productRepositry: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepositry: Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ) {}
  async create(createProductDto: CreateProductDto, user: User) {
    try {
      const { images = [], ...productDetails } = createProductDto;
      const product = this.productRepositry.create({
        ...productDetails,
        images: images.map((image) =>
          this.productImageRepositry.create({ url: image }),
        ),
        user,
      });
      await this.productRepositry.save(product);
      return { ...product, images };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
  // TODO paginar
  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const products = await this.productRepositry.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      },
      // TODO relaciones
    });
    const productsFind = products.map((product) => ({
      ...product,
      images: product.images.map((image) => image.url),
    }));
    return {
      total: productsFind.length,
      products: productsFind,
    };
  }

  async findOne(term: string) {
    // buscar por title slug o id
    let product: Product;
    // console.log({ term });
    if (isUUID(term)) {
      product = await this.productRepositry.findOneBy({ id: term });
    } else {
      // El queryBuilder es una forma de hacer consultas a la base de datos
      const queryBuilder = this.productRepositry.createQueryBuilder('product');
      product = await queryBuilder
        .where('UPPER(title)=:title or slug=:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('product.images', 'images')
        .getOne();
      // product = await this.productRepositry.findOneBy({
      //   slug: term,
      // });
    }
    if (!product)
      throw new NotFoundException(`Product not found with id: ${term}`);
    return product;
  }

  async findOnePlain(term: string) {
    const { images = [], ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: images.map((image) => image.url),
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRepositry.preload({
      id,
      ...toUpdate,
    });
    if (!product)
      throw new NotFoundException(`Product not found with id: ${id}`);

    // create queryRunner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });
        product.images = images.map((image) =>
          this.productImageRepositry.create({ url: image }),
        );
      } else {
        // product.images = [];
      }

      product.user = user;
      await queryRunner.manager.save(product);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      // await this.productRepositry.save(product);
      return this.findOnePlain(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    const productDelete = await this.productRepositry.remove(product);
    return {
      productDelete,
    };
  }
  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    // console.log(error);
    this.logger.error(error);
    throw new InternalServerErrorException('Ayuda');
  }
  async deleteAllProducts() {
    const query = this.productRepositry.createQueryBuilder('product');
    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
}
