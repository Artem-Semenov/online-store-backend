import { IsString } from "class-validator";

export class RefresTokenhDto {
  @IsString()
  refreshToken: string;
}
