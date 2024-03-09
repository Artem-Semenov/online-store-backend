import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Request, Response } from "express";
import { Ttokens } from "src/token/types/tokens.interface";
import { AES, enc } from "crypto-js";

@Injectable()
export class JweService {
  private privateKey = process.env.JWE_ECRYPTION_SECRET;
  JWE_cookie_name = process.env.JWE_COOKIE_NAME;
  JWE_expires_in_days = 7;

  constructor() {}

  encrypt(payload: Ttokens) {
    const encrypted = AES.encrypt(
      JSON.stringify({ payload }),
      this.privateKey
    ).toString();

    // console.log("encrypted", encrypted);

    return encrypted;
  }

  decrypt(jwe: string): Ttokens {
    const decrypted = JSON.parse(
      AES.decrypt(jwe, this.privateKey).toString(enc.Utf8)
    ).payload;

    // console.log("decrypted", decrypted);

    return decrypted;
  }

  addJWEToResponse(res: Response, jwe: string) {
    const expiresIn = new Date();
    expiresIn.setDate(expiresIn.getDate() + this.JWE_expires_in_days);
    res.cookie(this.JWE_cookie_name, jwe, {
      httpOnly: true,
      domain: "localhost",
      expires: expiresIn,
      secure: true,
      sameSite: "none",
    });
  }

  removeJWEFromResponse(res: Response) {
    res.cookie(this.JWE_cookie_name, "", {
      httpOnly: true,
      domain: "localhost",
      expires: new Date(0),
      secure: true,
      sameSite: "none",
    });
  }

  getPayloadFromRequest(req: Request): Ttokens {
    const jwe = req.cookies[this.JWE_cookie_name];
    if (!jwe) throw new UnauthorizedException("jwe token is missing");

    try {
      const decrypted = this.decrypt(jwe);
      const { accessToken, refreshToken } = decrypted;
      return { accessToken, refreshToken };
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException("token is invalid");
    }
  }
}
