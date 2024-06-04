import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { AccessJwtPayload } from './interfaces/access-jwt-payload.interface';
import { Auth } from './entities/auth.entity';
import { ConfigService } from '../config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, plainPassword: string): Promise<User> {
    const user = await this.usersService.findOne({
      username,
    });
    if (!user) {
      throw new UnauthorizedException('no such user exists');
    }
    if (!user.hashedPassword) {
      throw new InternalServerErrorException(
        'unexpectedly no password found for the user',
      );
    }

    const match = await bcrypt.compare(plainPassword, user.hashedPassword);
    if (!match) {
      throw new UnauthorizedException('the provided password is invalid');
    }

    return new User(user);
  }

  private async generateJwt(user: User): Promise<string> {
    const payload: AccessJwtPayload = {
      sub: user.id,
      username: user.username,
    };
    return await this.jwtService.signAsync(payload, {
      secret: this.configService.JWT_SECRET,
    });
  }

  async login(user: User): Promise<Auth> {
    return new Auth({
      user,
      accessToken: await this.generateJwt(user),
    });
  }

  async register(registerDto: RegisterDto): Promise<Auth> {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.usersService.create({
      username: registerDto.username,
      hashedPassword: hashedPassword,
    });
    if (!user) {
      throw new BadRequestException(
        'invalid registration data: try to use other credentials to create a user',
      );
    }

    return new Auth({
      user,
      accessToken: await this.generateJwt(user),
    });
  }
}
