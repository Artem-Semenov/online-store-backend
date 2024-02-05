import { Injectable } from "@nestjs/common";
import { StatiscticsDto } from "./dto/statistics.dto";
import { PrismaService } from "src/prisma.service";
import { UserService } from "src/user/user.service";

@Injectable()
export class StatisticsService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService
  ) {}

  async getMain(userId: number) {
    const user = await this.userService.getUserById(userId, {
      orders: {
        select: {
          items: true,
        },
      },
      reviews: true,
    });

    //TODO - rewrite to SQL
    // return user.orders;

    return [
      {
        name: "Orders",
        value: user.orders.length,
      },
      {
        name: "Reviews",
        value: user.reviews.length,
      },
      {
        name: "Favoritse",
        value: user.favorites.length,
      },
      {
        name: "Total amount",
        value: 1000,
      },
    ];
  }
}
