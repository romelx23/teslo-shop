import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { SeedService } from './seed.service';
import { ApiTags } from '@nestjs/swagger/dist';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  // @Auth(ValidRoles.Admin)
  @Get()
  executeSeed() {
    return this.seedService.runSeed();
  }
}
