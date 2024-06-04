import { ApiProperty } from '@nestjs/swagger';

export abstract class Response {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;
}
