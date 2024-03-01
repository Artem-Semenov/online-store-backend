import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { PrismaService } from "src/prisma.service";
import { faker } from "@faker-js/faker";
import { hash } from "argon2";
import { returnUserObject } from "src/user/return-user-object";
import { Prisma } from "@prisma/client";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const isSameUser = await this.getUserByEmail(createUserDto.email);

    if (isSameUser) {
      throw new BadRequestException("Email is already in use!");
    }

    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        name: createUserDto.name || "",
        avatarPath: faker.image.avatar(),
        phone: createUserDto.phone || "",
        password: await hash(createUserDto.password),
        activationLink: createUserDto.activationLink,
      },
    });

    return user;
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: {
        ...returnUserObject,
      },
    });

    return users;
  }

  async getUserByEmail(email: string) {
    const user = this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    return user;
  }

  async getUserById(id: number, selectObject: Prisma.UserSelect = {}) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        ...returnUserObject,
        favorites: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            slug: true,
          },
        },
        ...selectObject,
      },
    });

    if (!user) {
      throw new NotFoundException("user not found");
    }

    return user;
  }

  async getUserByActivationLink(activationLink: string) {
    const user = this.prisma.user.findUnique({
      where: {
        activationLink,
      },
    });

    return user;
  }

  async updateProfile(id: number, dto: UpdateUserDto) {
    const user = await this.getUserById(id);
    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        email: dto.email,
        name: dto.name,
        avatarPath: dto.avatarPath,
        phone: dto.phone,
        password: dto.password ? await hash(dto.password) : user.password,
      },
    });
  }

  async activateUser(id: number) {
    await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        activated: true,
      },
    });

    return true;
  }

  async toggleFavorite(id: number, productId: number) {
    const user = await this.getUserById(id);

    if (!user) throw new NotFoundException("User not found!");

    const isExist = user.favorites.some((product) => product.id === productId);

    await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        favorites: {
          [isExist ? "disconnect" : "connect"]: {
            id: productId,
          },
        },
      },
    });
    return { message: "success" };
  }
}
