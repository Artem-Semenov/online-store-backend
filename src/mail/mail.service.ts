import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { MailDto } from "src/mail/dto/mail.dto";

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  send = async (data: MailDto) => {
    try {
      const sendMail = await this.mailerService.sendMail({
        to: data.to, // list of receivers
        from: "noreply@nestjs.com", // sender address
        subject: data.subject, // Subject line
        text: data.text, // plaintext body
        html: data.html, // HTML body content
      });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  async sendActivationLink(to: string, link: string) {
    return this.send({
      to,
      html: this.getActivateEmailHTML(link),
      subject: `Activate yout account on ${process.env.CLIENT_URL}`,
      text: "",
    });
  }

  private getActivateEmailHTML(link: string) {
    return `
    <div>
        <h1>To activate your account - click on the link</h1>
        <a href="${link}">${link}</a>
    </div>
    `;
  }
}
