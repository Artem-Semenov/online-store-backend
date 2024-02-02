import { faker } from "@faker-js/faker";
import { PrismaClient, Product } from "@prisma/client";
import * as dotEnv from "dotenv";
import { getRandomNumber } from "src/utils/random-number";
import { generateSlug } from "src/utils/generate-slug";

dotEnv.config();

const prisma = new PrismaClient();

const createProducts = async (quantity: number) => {
  const products: Product[] = [];
  for (let i = 0; i < quantity; i++) {
    const productName = faker.commerce.productName();
    const categoryName = faker.commerce.department();

    const product = await prisma.product.create({
      data: {
        name: productName,
        slug: generateSlug(productName),
        description: faker.commerce.productDescription(),
        price: +faker.commerce.price({ min: 10, max: 1599, dec: 0 }),
        images: Array.from({ length: getRandomNumber(2, 6) }).map((el) =>
          faker.image.url()
        ),
        category: {
          create: {
            name: categoryName,
            slug: generateSlug(categoryName),
          },
        },
        reviews: {
          create: [
            {
              rating: faker.number.int({ min: 1, max: 5 }),
              text: faker.lorem.paragraph(),
              user: {
                connect: {
                  id: 1,
                },
              },
            },
            {
              rating: faker.number.int({ min: 1, max: 5 }),
              text: faker.lorem.paragraph(),
              user: {
                connect: {
                  id: 1,
                },
              },
            },
          ],
        },
      },
    });

    products.push(product);
  }

  console.log(`Created ${products.length} products`);
};

async function main() {
  console.log("start seeding...");
  await createProducts(10);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
