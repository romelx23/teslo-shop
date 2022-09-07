import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Headers,
  SetMetadata,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IncomingHttpHeaders } from 'http';
import { AuthService } from './auth.service';
import { Auth, GetUser, RawHeaders } from './decorators';
import { RoleProtected } from './decorators/role-protected.decorator';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role.guard';
import { ValidRoles } from './interfaces';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiResponse } from '@nestjs/swagger/dist';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @ApiResponse({ status: 200, description: 'Success' })
  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }
  @Get('check-auth-status')
  @Auth()
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    @Request() request: Express.Request,
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @RawHeaders() rawHeaders: string[],
    @Headers() headers: IncomingHttpHeaders,
  ) {
    console.log({ headers });
    console.log({ rawHeaders });
    // console.log({ userEmail });
    // console.log({ user });
    // testingPrivateRoute(@Request() request: Express.Request) {
    // console.log({ user: request.user });
    return {
      ok: true,
      message: 'Hola mundo privado',
      user,
      userEmail,
    };
  }
  // @SetMetadata('roles', ['admin', 'super-user'])
  @Get('private2')
  @RoleProtected(ValidRoles.SuperUser, ValidRoles.Admin, ValidRoles.User)
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRouter2(@GetUser() user: User) {
    return {
      ok: true,
      user,
    };
  }
  @ApiBearerAuth()
  @Get('private3')
  @Auth(ValidRoles.Admin, ValidRoles.User)
  privateRouter3(@GetUser() user: User) {
    return {
      ok: true,
      user,
    };
  }
}
