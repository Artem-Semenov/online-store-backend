import { Module } from "@nestjs/common";
import { JweService } from "./jwe.service";

@Module({
  providers: [JweService],
})
export class JweModule {}
