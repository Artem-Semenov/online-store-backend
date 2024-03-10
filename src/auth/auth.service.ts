import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import { verify } from "argon2";
import { AuthDto, LoginDto } from "src/auth/dto/auth.dto";
import { JweService } from "src/jwe/jwe.service";
import { MailService } from "src/mail/mail.service";
import { PrismaService } from "src/prisma.service";
import { TokenService } from "src/token/token.service";
import { CreateUserDto } from "src/user/dto/create-user.dto";
import { UserService } from "src/user/user.service";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private jwt: JwtService,
    private mailService: MailService,
    private tokenService: TokenService,
    private jweService: JweService
  ) {}

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

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto);

    const tokens = this.tokenService.issueTokens(user);
    const jwe = this.jweService.encrypt(tokens);
    return {
      user: this.returnUserFields(user),
      jwe,
    };
  }

  async oAuthLogin(userData) {
    console.log("user", userData);
    if (!userData) {
      throw new Error("User not found!!!");
    }

    let user = await this.userService.getUserByEmail(userData.email);

    if (!user) {
      const dto: CreateUserDto = {
        email: userData.email,
        name: userData.name,
        password: "",
        activationLink: "",
        phone: "",
      };

      user = await this.userService.create({
        ...dto,
        activated: true,
      });
    }

    const tokens = this.tokenService.issueTokens(user);
    const jwe = this.jweService.encrypt(tokens);

    return {
      user: this.returnUserFields(user),
      jwe,
    };
  }

  async getNewJweToken(refreshToken: string) {
    const result = await this.jwt.verifyAsync(refreshToken);

    if (!result) throw new UnauthorizedException("invalid refresh token");

    const user = await this.userService.getUserById(result.id, { role: true });

    const tokens = this.tokenService.issueTokens(user);
    const jwe = this.jweService.encrypt(tokens);

    return {
      user: this.returnUserFields(user),
      jwe,
    };
  }

  async activateAccount(activationLink: string) {
    const user = await this.userService.getUserByActivationLink(activationLink);
    if (!user)
      throw new NotFoundException(
        "Сталася якась помилка! Будь ласка зв'яжіться з нами!"
      );

    await this.userService.activateUser(user.id);

    const tokens = this.tokenService.issueTokens(user);
    const jwe = this.jweService.encrypt(tokens);

    return {
      user: this.returnUserFields(user),
      jwe,
    };
  }

  private async validateUser(dto: LoginDto) {
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

  private returnUserFields(user: User) {
    return {
      id: user.id,
      email: user.email,
    };
  }
}
