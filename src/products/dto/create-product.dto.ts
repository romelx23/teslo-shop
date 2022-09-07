import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    default: 'T-Shirt teslo',
    description: 'Product title (unique)',
    nullable: false,
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({
    default: 20,
    description: 'Product price',
    nullable: false,
    minimum: 0,
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

  @ApiProperty({
    default: 'lorem1 afsaf as fdsfdsg s gsdg sdgsdg ds gdsgdsg',
    description: 'Product description',
    nullable: true,
    type: String,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    default: 't_shirt_teslo',
    description: 'Product slug (unique)',
    nullable: false,
    minLength: 3,
  })
  @IsString()
  @IsOptional()
  @MinLength(3)
  slug?: string;

  @ApiProperty({
    default: 10,
    description: 'Product stock',
    nullable: false,
    minimum: 0,
    type: Number,
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  stock?: number;

  @ApiProperty({
    default: ['M', 'XL', 'XXL'],
    description: 'Product categories',
    nullable: false,
    type: [String],
  })
  @IsString({
    each: true,
  })
  @IsArray()
  sizes: string[];

  @ApiProperty({
    default: ['men', 'women'],
    description: 'Product categories',
    nullable: false,
    type: [String],
  })
  @IsIn(['men', 'women', 'kid', 'unisex'])
  gender: string;

  @ApiProperty({
    default: ['shirt'],
    description: 'Product Tags',
    nullable: true,
    type: [String],
  })
  @IsString({
    each: true,
  })
  @IsArray()
  @IsOptional()
  tags: string[];

  @ApiProperty({
    default: ['shirt'],
    description: 'Product Images',
    nullable: true,
    type: [String],
  })
  @IsString({
    each: true,
  })
  @IsArray()
  @IsOptional()
  images: string[];
}
