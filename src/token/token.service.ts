import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class TokenService {
  constructor(private jwt: JwtService) {}

  EXPIRES_DAY_REFRESH_TOKEN = 7;
  REFRESH_TOKEN_NAME = "refreshToken";

  issueTokens(userId: number) {
    const data = {
      id: userId,
    };

    const accessToken = this.jwt.sign(data, {
      expiresIn: "1h",
    });

    const refreshToken = this.jwt.sign(data, {
      expiresIn: `${this.EXPIRES_DAY_REFRESH_TOKEN}d`,
    });

    return { accessToken, refreshToken };
  }

  //TODO - save token to db ?
}
