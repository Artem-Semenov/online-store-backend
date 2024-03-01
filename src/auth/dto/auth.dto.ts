import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class AuthDto {
  @IsEmail()
  email: string;

  @MinLength(6, {
    message: "Password must be at least 6 characters long",
  })
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  @MinLength(6, {
    message: "Phone must be at least 10 characters long",
  })
  phone: string;
}
