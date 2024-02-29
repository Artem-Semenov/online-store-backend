import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { MailService } from "./mail.service";
import { MailDto } from "src/mail/dto/mail.dto";

@Controller("mail")
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @UsePipes(new ValidationPipe())
  @Post("send")
  send(@Body() data: MailDto) {
    return this.mailService.send(data);
  }
}
