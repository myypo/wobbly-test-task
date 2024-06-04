import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Product } from './entities/product.entity';
import { PrismaService } from '../prisma/prisma.service';
import { ROW_NOT_FOUND } from '../prisma/prisma.constants';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.ProductCreateInput): Promise<Product | null> {
    return this.prisma.product.create({ data });
  }

  async findMany(params: {
    skip?: number;

    name?: string;
    description?: string;
    category?: string;
    price?: number;
  }): Promise<Product[]> {
    return this.prisma.product.findMany({
      skip: params.skip,
      where: {
        name: params.name,
        description: params.description,
        category: params.category,
        price: params.price,
      },
    });
  }

  async getById(id: string): Promise<Product> {
    const product = await this.findOne({ id });
    if (!product) {
      throw new NotFoundException('no product with such id exists');
    }
    return product;
  }

  private async findOne(
    where: Prisma.ProductWhereUniqueInput,
  ): Promise<Product | null> {
    return this.prisma.product.findUnique({ where });
  }

  async update(
    where: Prisma.ProductWhereUniqueInput,
    data: Prisma.ProductUpdateInput,
  ): Promise<Product | undefined> {
    try {
      return this.prisma.product.update({
        data,
        where,
      });
    } catch (e) {
      if (e.code === ROW_NOT_FOUND) {
        throw new NotFoundException('the product to be updated does not exist');
      }

      throw e;
    }
  }

  async delete(where: Prisma.ProductWhereUniqueInput): Promise<void> {
    const deleted_product = await this.prisma.product.delete({
      select: { id: true },
      where,
    });
    if (!deleted_product) {
      throw new NotFoundException('the product to be deleted does not exist');
    }
  }
}
