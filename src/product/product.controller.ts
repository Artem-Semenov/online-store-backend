import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  Query,
  ParseIntPipe,
  HttpCode,
  Put,
} from "@nestjs/common";
import { ProductService } from "./product.service";
import { ProductDto } from "./dto/product.dto";
import { Auth } from "src/auth/decorators/auth.decorator";
import { getAllProductDto } from "src/product/dto/get-all.product.dto";

@Controller("products")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @UsePipes(new ValidationPipe())
  @Get()
  async getAll(@Query() queryDto: getAllProductDto) {
    return this.productService.getAll(queryDto);
  }

  @Get(":id")
  async get(@Param("id", ParseIntPipe) id: number) {
    return this.productService.byId(id);
  }

  @Get("similar/:id")
  async getSimilar(@Param("id", ParseIntPipe) id: number) {
    return this.productService.getSimilar(id);
  }

  @Get("by-slug/:slug")
  async getBySlug(@Param("slug") slug: string) {
    return this.productService.bySlug(slug);
  }

  @Get("by-category/:slug")
  async getByCategory(@Param("slug") slug: string) {
    return this.productService.byCategory(slug);
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Auth()
  @Post()
  async create() {
    return this.productService.create();
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Put(":id")
  @Auth()
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateProductDto: ProductDto
  ) {
    return this.productService.update(id, updateProductDto);
  }

  @HttpCode(200)
  @Delete(":id")
  @Auth()
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.productService.delete(id);
  }
}
