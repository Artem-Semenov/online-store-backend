import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { PrismaService } from "src/prisma.service";
import { faker } from "@faker-js/faker";
import { hash } from "argon2";
import { exclude } from "src/helpers/helpers";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        name: faker.person.firstName(),
        avatarPath: faker.image.avatar(),
        phone: faker.phone.number(),
        password: await hash(createUserDto.password),
      },
    });

    return user;
  }

  async findAll() {
    const users = await this.prisma.user.findMany();

    return users.map((user) => exclude(user, ["password"]));
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async getUserByEmail(email: string) {
    const user = this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    return user;
  }

  async getUserById(id: number) {
    const user = this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    return user;
  }
}
