import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class CreateUserDto {
  @IsEmail()
  email: string;

  @MinLength(6, {
    message: "Password must be at least 6 characters long",
  })
  @IsString()
  password: string;

  @IsString()
  activationLink: string;

  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  @MinLength(6, {
    message: "Phone must be at least 10 characters long",
  })
  phone: string;
}
