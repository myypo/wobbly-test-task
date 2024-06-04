import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  Query,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  ProductListResponse,
  ProductResponse,
} from './entities/product.entity';
import { ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ListProductsDto } from './dto/list-products.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    type: ProductResponse,
    description: 'The product has been successfully created',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid product data',
  })
  @ApiResponse({
    status: 403,
    description: 'Invalid or expired JWT access token provided',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiQuery({ type: ListProductsDto })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Retrieved products according to filters',
    type: ProductListResponse,
  })
  @ApiResponse({
    status: 403,
    description: 'Invalid or expired JWT access token provided',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidNonWhitelisted: false,
    }),
  )
  findMany(@Query() listProductsDto: ListProductsDto) {
    return this.productsService.findMany(listProductsDto);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Retrieved product by id',
    type: ProductResponse,
  })
  @ApiResponse({
    status: 403,
    description: 'Invalid or expired JWT access token provided',
  })
  @ApiResponse({
    status: 404,
    description: 'The product was not found',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  getById(@Param('id') id: string) {
    return this.productsService.getById(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Successfully updated an existing product',
    type: ProductResponse,
  })
  @ApiResponse({
    status: 403,
    description: 'Invalid or expired JWT access token provided',
  })
  @ApiResponse({
    status: 404,
    description: 'The product to be updated was not found',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update({ id }, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiBearerAuth()
  @ApiResponse({
    status: 204,
    description: 'Successfully deleted product by id',
  })
  @ApiResponse({
    status: 403,
    description: 'Invalid or expired JWT access token provided',
  })
  @ApiResponse({
    status: 404,
    description: 'The product to be deleted was not found',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  delete(@Param('id') id: string) {
    return this.productsService.delete({ id });
  }
}
