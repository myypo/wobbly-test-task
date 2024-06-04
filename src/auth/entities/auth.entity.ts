import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Response } from '../../response/response.entity';

export class Auth {
  @ApiProperty()
  user: User;

  @ApiProperty()
  accessToken: string;

  constructor(auth: Auth) {
    Object.assign(this, auth);
  }
}

export class AuthResponse extends Response {
  @ApiPropertyOptional()
  data?: Auth;
}
