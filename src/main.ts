import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as cookieParser from "cookie-parser";
import { NestExpressApplication } from "@nestjs/platform-express";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix("api");
  app.use(cookieParser());
  app.enableCors({
    origin: ["http://localhost:3000"],
    credentials: true,
    exposedHeaders: "set-cookie",
  });
  app.disable("x-powered-by");

  await app.listen(4200);
}
bootstrap();
