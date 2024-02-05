import { Prisma } from "@prisma/client";
import { returnCategoryObject } from "src/category/return-category-object";
import { returnReviewObject } from "src/review/return-review-object copy";

export const productReturnObject: Prisma.ProductSelect = {
  images: true,
  description: true,
  id: true,
  name: true,
  price: true,
  createdAt: true,
  slug: true,
};

export const productReturnObjectFullset: Prisma.ProductSelect = {
  ...productReturnObject,
  reviews: { select: returnReviewObject },
  category: { select: returnCategoryObject },
};
