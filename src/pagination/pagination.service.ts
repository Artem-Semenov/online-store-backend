import { Injectable } from "@nestjs/common";
import { PaginationDto } from "src/pagination/dto/pagination.dto";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class PaginationService {
  constructor(private prisma: PrismaService) {}

  getPaginations(dto: PaginationDto, defaultPage = 30) {
    const page = dto.page ? +dto.page : 1;
    const perPage = dto?.perPage ? +dto.perPage : defaultPage;

    const skip = (page - 1) * perPage;

    return { perPage, skip };
  }
}
