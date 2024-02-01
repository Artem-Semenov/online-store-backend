import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import { verify } from "argon2";
import { AuthDto } from "src/auth/dto/auth.dto";
import { RefresTokenhDto } from "src/auth/dto/refresh-token.dto";
import { PrismaService } from "src/prisma.service";
import { UserService } from "src/user/user.service";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private jwt: JwtService
  ) {}

  async register(dto: AuthDto) {
    const existUser = await this.userService.getUserByEmail(dto.email);

    if (existUser) throw new BadRequestException("User already exist");

    const user = await this.userService.create(dto);

    const tokens = await this.issueTokens(user.id);

    return {
      user: this.returnUserFields(user),
      ...tokens,
    };
  }

  async getNewTokens({ refreshToken }: RefresTokenhDto) {
    const result = await this.jwt.verifyAsync(refreshToken);

    if (!result) throw new UnauthorizedException("invalid refresh token");

    const user = await this.userService.getUserById(result.id);

    const tokens = await this.issueTokens(user.id);

    return {
      user: this.returnUserFields(user),
      ...tokens,
    };
  }

  async login(dto: AuthDto) {
    const user = await this.validateUser(dto);

    const tokens = await this.issueTokens(user.id);
    return {
      user: this.returnUserFields(user),
      ...tokens,
    };
  }

  private async validateUser(dto: AuthDto) {
    const user = await this.userService.getUserByEmail(dto.email);

    if (!user) throw new NotFoundException("User not found");

    const isValid = verify(user.password, dto.password);

    if (!isValid) throw new UnauthorizedException("Invalid credentials");

    return user;
  }

  private async issueTokens(userId: number) {
    const data = {
      id: userId,
    };

    const accessToken = this.jwt.sign(data, {
      expiresIn: "1h",
    });

    const refreshToken = this.jwt.sign(data, {
      expiresIn: "7d",
    });

    return { accessToken, refreshToken };
  }

  private returnUserFields(user: User) {
    return {
      id: user.id,
      email: user.email,
    };
  }
}
