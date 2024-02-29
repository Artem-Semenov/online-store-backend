import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { PrismaService } from "src/prisma.service";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "./user/user.module";
import { ProductModule } from "./product/product.module";
import { ReviewModule } from "./review/review.module";
import { CategoryModule } from "./category/category.module";
import { OrderModule } from "./order/order.module";
import { StatisticsModule } from "./statistics/statistics.module";
import { PaginationModule } from "./pagination/pagination.module";
import { MailModule } from "./mail/mail.module";
import { MailerModule } from "@nestjs-modules/mailer";

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot(),
    UserModule,
    ProductModule,
    ReviewModule,
    CategoryModule,
    OrderModule,
    StatisticsModule,
    PaginationModule,
    MailModule,
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST,
        port: +process.env.SMPT_PORT,
        secure: false,
        auth: {
          user: process.env.SMTP_LOGIN,
          pass: process.env.SMTP_KEY,
        },
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
