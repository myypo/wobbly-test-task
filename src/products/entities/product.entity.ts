import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Response } from '../../response/response.entity';

export class Product {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  category: string;

  @ApiProperty()
  price: number;

  constructor(product: Product) {
    Object.assign(this, product);
  }
}

export class ProductResponse extends Response {
  @ApiPropertyOptional()
  data?: Product;
}

export class ProductListResponse extends Response {
  @ApiPropertyOptional({ isArray: true, type: Product })
  data?: Product[];
}
