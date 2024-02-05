import { Injectable, NotFoundException } from "@nestjs/common";
import { ReviewDto } from "./dto/review.dto";
import { PrismaService } from "src/prisma.service";
import { returnReviewObject } from "src/review/return-review-object copy";

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return this.prisma.review.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: returnReviewObject,
    });
  }

  async byId(id: number) {
    const review = await this.prisma.review.findUnique({
      where: {
        id,
      },
      select: returnReviewObject,
    });

    if (!review) {
      throw new NotFoundException("Category not found");
    }

    return review;
  }

  async create(userId: number, dto: ReviewDto, productId: number) {
    return this.prisma.review.create({
      data: {
        ...dto,
        product: {
          connect: {
            id: productId,
          },
        },
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  async getAverageValueByProductId(productId: number) {
    return this.prisma.review
      .aggregate({
        where: { productId },
        _avg: { rating: true },
      })
      .then((data) => data._avg);
  }

  async delete(id: number) {
    return this.prisma.review.delete({
      where: {
        id,
      },
    });
  }
}
