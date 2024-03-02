import { Module } from "@nestjs/common";
import { TokenService } from "./token.service";
import { TokenController } from "./token.controller";
import { JwtService } from "@nestjs/jwt";

@Module({
  controllers: [TokenController],
  providers: [TokenService, JwtService],
})
export class TokenModule {}
