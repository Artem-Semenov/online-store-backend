import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import { verify } from "argon2";
import { Response } from "express";
import { AuthDto } from "src/auth/dto/auth.dto";
import { RefresTokenhDto } from "src/auth/dto/refresh-token.dto";
import { MailService } from "src/mail/mail.service";
import { PrismaService } from "src/prisma.service";
import { UserService } from "src/user/user.service";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private jwt: JwtService,
    private mailService: MailService
  ) {}

  private EXPIRES_DAY_REFRESH_TOKEN = 1;
  REFRESH_TOKEN_NAME = "refreshToken";

  async register(dto: AuthDto) {
    const existUser = await this.userService.getUserByEmail(dto.email);

    if (existUser) throw new BadRequestException("User already exist");

    const activationLink = uuidv4();

    const user = await this.userService.create({ ...dto, activationLink });
    await this.mailService.sendActivationLink(
      dto.email,
      `${process.env.API_URL}/api/auth/activate/${activationLink}`
    );

    return true;
  }

  async login(dto: AuthDto) {
    const user = await this.validateUser(dto);

    const tokens = this.issueTokens(user.id);
    return {
      user: this.returnUserFields(user),
      ...tokens,
    };
  }

  async getNewTokens(refreshToken: string) {
    const result = await this.jwt.verifyAsync(refreshToken);

    if (!result) throw new UnauthorizedException("invalid refresh token");

    const user = await this.userService.getUserById(result.id);

    const tokens = this.issueTokens(user.id);

    return {
      user,
      ...tokens,
    };
  }

  async activateAccount(activationLink: string) {
    const user = await this.userService.getUserByActivationLink(activationLink);
    if (!user)
      throw new NotFoundException(
        "Сталася якась помилка! Будь ласка зв'яжіться з нами!"
      );
    await this.userService.activateUser(user.id);
    return true;
  }

  private async validateUser(dto: AuthDto) {
    const user = await this.userService.getUserByEmail(dto.email);

    if (!user) throw new NotFoundException("Юзера із таким email не знайдено");

    if (!user.activated) {
      throw new UnauthorizedException(
        "Акаунт не було підтверджено, будь ласка перевірте пошту"
      );
    }
    const isValid = await verify(user.password, dto.password);

    if (!isValid) throw new UnauthorizedException("неправильний пароль");

    return user;
  }

  private issueTokens(userId: number) {
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

  addRefreshTokenToResponse(res: Response, refreshToken: string) {
    const expiresIn = new Date();
    expiresIn.setDate(expiresIn.getDate() + this.EXPIRES_DAY_REFRESH_TOKEN);
    res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
      httpOnly: true,
      domain: "localhost",
      expires: expiresIn,
      secure: true,
      sameSite: "none",
    });
  }

  removeRefreshTokenFromResponse(res: Response) {
    res.cookie(this.REFRESH_TOKEN_NAME, "", {
      httpOnly: true,
      domain: "localhost",
      expires: new Date(0),
      secure: true,
      sameSite: "none",
    });
  }

  private returnUserFields(user: User) {
    return {
      id: user.id,
      email: user.email,
    };
  }
}
