import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }
  // async validate(payload: JwtPayload): Promise<User> {
  //   const { id } = payload;
  //   console.log(id);
  //   if (!id) throw new UnauthorizedException('No hay id');
  //   const user = await this.userRepository.findOne({ where: { id } });
  //   console.log(user);
  //   if (!user) throw new UnauthorizedException('Usuario no encontrado');
  //   if (!user.isActive) throw new UnauthorizedException('Usuario inactivo');
  //   return user;
  // }
  async validate(payload: JwtPayload) {
    const { id } = payload;
    // console.log(
    //   '🚀 ~ file: jwt.strategy.ts ~ line 37 ~ JwtStrategy ~ validate ~ id',
    //   id,
    // );
    const query = await this.userRepository.createQueryBuilder('user');
    const user = await query.where('user.id = :id', { id }).getOne();

    // console.log('user', user);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.isActive) throw new UnauthorizedException('User is not active');
    return user;
  }
}
