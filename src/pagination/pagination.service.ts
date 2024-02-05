import { Injectable } from "@nestjs/common";
import { PaginationDto } from "src/pagination/dto/pagination.dto";

@Injectable()
export class PaginationService {
  getPaginations(dto: PaginationDto, defaultPage = 30) {
    const page = dto.page ? +dto.page : 1;
    const perPage = dto?.perPage ? +dto.perPage : defaultPage;

    const skip = (page - 1) * perPage;

    return { perPage, skip };
  }
}
