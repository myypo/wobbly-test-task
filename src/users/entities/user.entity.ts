import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class User {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @Exclude()
  hashedPassword?: string;

  constructor(user: User) {
    Object.assign(this, user);
  }
}

export class UserResponse extends Response {
  @ApiPropertyOptional()
  data?: User;
}
