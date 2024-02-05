import { IsEnum, IsOptional, IsString } from "class-validator";
import { PaginationDto } from "src/pagination/dto/pagination.dto";

export enum EnumProductSort {
  HIHG_PRICE = "high-price",
  LOW_PRICE = "low-price",
  NEWEST = "newest",
  OLDEST = "oldest",
}

export class getAllProductDto extends PaginationDto {
  @IsOptional()
  @IsEnum(EnumProductSort)
  sort?: EnumProductSort;

  @IsOptional()
  @IsString()
  searchTerm?: string;
}
