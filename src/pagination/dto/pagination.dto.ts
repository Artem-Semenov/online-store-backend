import { IsOptional } from "class-validator";

export class PaginationDto {
  @IsOptional()
  page: string;

  @IsOptional()
  perPage: string;
}
