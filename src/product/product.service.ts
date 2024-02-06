import { Injectable, NotFoundException } from "@nestjs/common";
import { ProductDto } from "./dto/product.dto";
import { PrismaService } from "src/prisma.service";
import {
  productReturnObject,
  productReturnObjectFullset,
} from "src/product/return-product-object";
import { generateSlug } from "src/utils/generate-slug";
import {
  EnumProductSort,
  getAllProductDto,
} from "src/product/dto/get-all.product.dto";
import { PaginationService } from "src/pagination/pagination.service";
import { Prisma } from "@prisma/client";

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private paginationService: PaginationService
  ) {}

  async getAll(dto: getAllProductDto) {
    const { sort, searchTerm } = dto;

    const prismaSort: Prisma.ProductOrderByWithRelationInput[] = [];

    if (sort === EnumProductSort.LOW_PRICE) {
      prismaSort.push({ price: "asc" });
    } else if (sort === EnumProductSort.HIHG_PRICE) {
      prismaSort.push({ price: "desc" });
    } else if (sort === EnumProductSort.OLDEST) {
      prismaSort.push({ createdAt: "asc" });
    } else {
      prismaSort.push({ createdAt: "desc" });
    }

    const prismaSearchTermFilter: Prisma.ProductWhereInput = searchTerm
      ? {
          OR: [
            {
              category: {
                name: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
              },
            },
            {
              name: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
          ],
        }
      : {};

    const { perPage, skip } = this.paginationService.getPaginations(dto);

    const products = await this.prisma.product.findMany({
      where: prismaSearchTermFilter,
      orderBy: prismaSort,
      skip,
      take: perPage,
    });

    console.log(products);

    return {
      products,
      length: await this.prisma.product.count({
        where: prismaSearchTermFilter,
      }),
    };
  }

  async byId(id: number) {
    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },
      select: productReturnObjectFullset,
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    return product;
  }

  async bySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: {
        slug,
      },
      select: productReturnObjectFullset,
    });

    if (!product) {
      throw new NotFoundException("Category not found");
    }

    return product;
  }

  async byCategory(categorySlug: string) {
    console.log(categorySlug);
    const products = await this.prisma.product.findMany({
      where: {
        category: {
          slug: categorySlug,
        },
      },
      select: productReturnObjectFullset,
    });

    if (!products || !products.length) {
      throw new NotFoundException("Category not found");
    }

    return products;
  }

  async getSimilar(id: number) {
    const currentProduct = await this.byId(id);

    const products = await this.prisma.product.findMany({
      where: {
        category: {
          name: currentProduct.category.name,
        },
        NOT: {
          id: currentProduct.id,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: productReturnObject,
    });

    return products;
  }

  async create() {
    const product = await this.prisma.product.create({
      data: {
        description: "",
        name: "",
        slug: "",
        price: 0,
      },
    });

    return product.id;
  }

  async update(id: number, dto: ProductDto) {
    const { description, categoryId, images, name, price } = dto;
    return this.prisma.product.update({
      where: {
        id,
      },
      data: {
        description,
        images,
        name,
        price,
        slug: generateSlug(name),
        category: {
          connect: {
            id: categoryId, // This will connect the product to the category with this id
          },
        },
      },
    });
  }

  async delete(id: number) {
    return this.prisma.product.delete({
      where: {
        id,
      },
    });
  }
}
