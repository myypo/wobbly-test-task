import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  Length,
  MinLength,
  IsInt,
  IsPositive,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @Length(3, 64)
  name: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  description: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  category: string;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  price: number;
}
