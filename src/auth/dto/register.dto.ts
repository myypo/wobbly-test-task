import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class RegisterDto {
  @ApiProperty()
  @IsString()
  @Length(3, 64)
  username: string;

  @ApiProperty()
  @IsString()
  @Length(6, 64)
  password: string;
}
