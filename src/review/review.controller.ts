import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseFloatPipe,
  UsePipes,
  ValidationPipe,
  HttpCode,
} from "@nestjs/common";
import { ReviewService } from "./review.service";
import { CurrentUser } from "src/auth/decorators/user.decorator";
import { Auth } from "src/auth/decorators/auth.decorator";
import { ReviewDto } from "src/review/dto/review.dto";

@Controller("reviews")
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get()
  @UsePipes(new ValidationPipe())
  async findAll() {
    return this.reviewService.getAll();
  }

  @Post(":productId")
  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Auth()
  async create(
    @Body() createReviewDto: ReviewDto,
    @CurrentUser("id") userId: number,
    @Param("productId", ParseFloatPipe) productId: number
  ) {
    return this.reviewService.create(userId, createReviewDto, productId);
  }

  @Delete(":id")
  @Auth()
  remove(@Param("id", ParseFloatPipe) id: number) {
    return this.reviewService.delete(id);
  }
}
