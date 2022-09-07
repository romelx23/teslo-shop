import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    default: 10,
    description: 'How many rows de you needs',
  })
  @IsOptional()
  @IsPositive()
  @Type(() => Number) //enableImpliocitConversion
  limit?: number;

  @ApiProperty({
    default: 10,
    description: 'How many rows de you need skip',
  })
  @IsOptional()
  @Min(0)
  @Type(() => Number) //enableImpliocitConversion
  offset?: number;
}
