import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDto, LoginDto } from "src/auth/dto/auth.dto";
import { Request, Response } from "express";
import { TokenService } from "src/token/token.service";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private tokenService: TokenService
  ) {}

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post("login")
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const { refreshToken, ...response } = await this.authService.login(dto);
    this.authService.addRefreshTokenToResponse(res, refreshToken);

    return response;
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post("register")
  async register(
    @Body() dto: AuthDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const response = await this.authService.register(dto);
    // this.authService.addRefreshTokenToResponse(res, refreshToken);
    return response;
  }

  @HttpCode(200)
  @Get("activate/:activationLink")
  async activateAccount(
    @Res() res: Response,
    @Param("activationLink") activationLink: string
  ) {
    try {
      const { refreshToken, ...responce } =
        await this.authService.activateAccount(activationLink);
      // this.authService.addRefreshTokenToResponse(res, refreshToken);
      res.redirect(`${process.env.CLIENT_URL}/login?activated=success`);
    } catch (error) {
      console.log(error);
      res.redirect(`${process.env.CLIENT_URL}/login`);
    }
  }

  @HttpCode(200)
  @Post("logout")
  async logout(@Res({ passthrough: true }) res: Response) {
    this.authService.removeRefreshTokenFromResponse(res);

    return true;
  }

  @HttpCode(200)
  @Post("login/access-token")
  async getNewTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshTokenFromCookie =
      req.cookies[this.tokenService.REFRESH_TOKEN_NAME];
    if (!refreshTokenFromCookie) {
      this.authService.removeRefreshTokenFromResponse(res);
      throw new UnauthorizedException("Refresh token was not provided");
    }

    const { refreshToken, ...response } = await this.authService.getNewTokens(
      refreshTokenFromCookie
    );

    this.authService.addRefreshTokenToResponse(res, refreshToken);

    return response;
  }
}
