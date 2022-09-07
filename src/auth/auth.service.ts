import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto, LoginUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });
      await this.userRepository.save(user);
      delete user.password;
      return {
        ...user,
        token: this.getJwtPayload({ id: user.id }),
      };
    } catch (error) {
      this.handleEErrors(error);
    }
  }
  private getJwtPayload(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }
  private handleEErrors(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    throw new InternalServerErrorException('Ayuda');
  }
  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;
    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true },
    });
    if (!user)
      throw new UnauthorizedException('Credenciales invalidas (email)');
    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Credenciales invalidas (password)');
    return {
      ...user,
      token: this.getJwtPayload({ id: user.id }),
    };
  }
  async checkAuthStatus(user: User) {
    try {
      return {
        ...user,
        token: this.getJwtPayload({ id: user.id }),
      };
    } catch (error) {
      throw new UnauthorizedException('No autorizado');
    }
  }
}
