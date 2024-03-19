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
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDto, LoginDto } from "src/auth/dto/auth.dto";
import { Request, Response } from "express";
import { JweService } from "src/jwe/jwe.service";
import { GoogleAuth } from "src/auth/decorators/auth.decorator";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private jweService: JweService
  ) {}

  @Get("google/callback")
  @GoogleAuth()
  async googleAuthCallback(@Req() req, @Res() res: Response) {
    try {
      // console.log("req", req);
      const { jwe, user } = await this.authService.oAuthLogin(req.user);
      this.jweService.addJWEToResponse(res, jwe);

      res.redirect(`${process.env.CLIENT_URL}/google-callback`);
    } catch (error) {
      console.log("error with google login", error);
      res.redirect(`${process.env.CLIENT_URL}/login`);
    }
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post("login")
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const { jwe, user } = await this.authService.login(dto);

    this.jweService.addJWEToResponse(res, jwe);

    return user;
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post("register")
  async register(
    @Body() dto: AuthDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const response = await this.authService.register(dto);
    return response;
  }

  @HttpCode(200)
  @Get("activate/:activationLink")
  async activateAccount(
    @Res() res: Response,
    @Param("activationLink") activationLink: string
  ) {
    try {
      const { jwe, user } =
        await this.authService.activateAccount(activationLink);
      this.jweService.addJWEToResponse(res, jwe);

      res.redirect(`${process.env.CLIENT_URL}/login?activated=success`);
    } catch (error) {
      console.log(error);
      res.redirect(`${process.env.CLIENT_URL}/login`);
    }
  }

  @HttpCode(200)
  @Post("logout")
  async logout(@Res({ passthrough: true }) res: Response) {
    this.jweService.removeJWEFromResponse(res);

    return true;
  }

  @HttpCode(200)
  @Post("login/access-token")
  async getNewTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const { refreshToken: refreshTokenFromCookie } =
      this.jweService.getPayloadFromRequest(req);

    if (!refreshTokenFromCookie) {
      this.jweService.removeJWEFromResponse(res);
      throw new UnauthorizedException("jwe token was not provided");
    }

    const { jwe, user } = await this.authService.getNewJweToken(
      refreshTokenFromCookie
    );

    this.jweService.addJWEToResponse(res, jwe);

    return user;
  }
}
