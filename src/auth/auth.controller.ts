import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Post,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDto } from "src/auth/dto/auth.dto";
import { RefresTokenhDto } from "src/auth/dto/refresh-token.dto";
import { Auth } from "src/auth/decorators/auth.decorator";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /* Login, getNewTokens */

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post("login")
  async login(@Body() dto: AuthDto) {
    return this.authService.login(dto);
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Auth()
  @Post("login/access-token")
  async getNewTokens(@Body() dto: RefresTokenhDto, @Headers() headers) {
    console.log(headers);
    return this.authService.getNewTokens(dto);
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post("register")
  async register(@Body() dto: AuthDto) {
    return this.authService.register(dto);
  }
}
