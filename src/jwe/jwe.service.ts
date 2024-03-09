import { Injectable } from "@nestjs/common";
import { createCipheriv, createDecipheriv, scryptSync } from "crypto";
import { Response } from "express";
import { Ttokens } from "src/token/types/tokens.interface";

@Injectable()
export class JweService {
  private privateKey = process.env.JWE_ECRYPTION_SECRET;
  private algorithm = "aes-256-ctr";
  private iv = Buffer.alloc(16, 0);
  private key = scryptSync(this.privateKey, "salt", 32);
  JWE_cookie_name = process.env.JWE_COOKIE_NAME;
  JWE_expires_in_days = 7;

  constructor() {}

  encrypt(payload: Ttokens) {
    const cipher = createCipheriv(this.algorithm, this.key, this.iv);
    const jwe =
      cipher.update(JSON.stringify(payload), "utf8", "hex") +
      cipher.final("hex");

    return jwe;
  }

  decrypt(jwe: string): Ttokens {
    const decipher = createDecipheriv(this.algorithm, this.key, this.iv);
    const decrypted =
      decipher.update(jwe, "hex", "utf8") + decipher.final("utf8");

    return JSON.parse(decrypted);
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
}
