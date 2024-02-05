import { Controller, Get } from "@nestjs/common";
import { StatisticsService } from "./statistics.service";
import { Auth } from "src/auth/decorators/auth.decorator";
import { CurrentUser } from "src/auth/decorators/user.decorator";

@Controller("statistics")
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  @Auth()
  getMainStatisctics(@CurrentUser("id") userId: number) {
    return this.statisticsService.getMain(userId);
  }
}
