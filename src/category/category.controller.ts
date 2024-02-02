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
  HttpCode,
  Put,
  ParseIntPipe,
} from "@nestjs/common";
import { CategoryService } from "./category.service";
import { Auth } from "src/auth/decorators/auth.decorator";
import { CategoryDto } from "src/category/dto/category.dto";

@Controller("categories")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get("")
  async getAll() {
    return this.categoryService.getAll();
  }

  @Get("by-slug/:slug")
  async getBySlug(@Param("slug") slug: string) {
    return this.categoryService.bySlug(slug);
  }

  @Get(":id")
  @Auth()
  async getById(@Param("id", ParseIntPipe) id: number) {
    return this.categoryService.byId(id);
  }

  @Post("create")
  @HttpCode(200)
  @Auth()
  async create() {
    return this.categoryService.create();
  }

  @Put(":id")
  @HttpCode(200)
  @Auth()
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: CategoryDto
  ) {
    return this.categoryService.update(id, dto);
  }

  @HttpCode(200)
  @Auth()
  @Delete(":id")
  async delete(@Param("id", ParseIntPipe) id: number) {
    return this.categoryService.delete(id);
  }
}
