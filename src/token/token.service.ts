import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Prisma, User } from "@prisma/client";
import { Ttokens } from "src/token/types/tokens.interface";

@Injectable()
export class TokenService {
  constructor(private jwt: JwtService) {}

  EXPIRES_DAY_REFRESH_TOKEN = 7;
  REFRESH_TOKEN_NAME = "refreshToken";

  issueTokens({ id, role }: User): Ttokens {
    const payload = {
      id,
      role,
    };

    const accessToken = this.jwt.sign(payload, {
      expiresIn: "15m",
    });

    const refreshToken = this.jwt.sign(payload, {
      expiresIn: `${this.EXPIRES_DAY_REFRESH_TOKEN}d`,
    });

    return { accessToken, refreshToken };
  }

  //TODO - save token to db ?
}
