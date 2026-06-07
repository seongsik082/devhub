import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const products = [
  {
    name: "백엔드 실습 노트",
    description: "API 설계와 DB 모델링을 기록하는 디지털 노트",
    price: 12000,
    stock: 30,
  },
  {
    name: "DevHub 프리미엄 강의권",
    description: "인증, 게시판, 주문 시스템을 단계별로 복습하는 강의권",
    price: 49000,
    stock: 12,
  },
  {
    name: "배포 체크리스트 템플릿",
    description: "Vercel 배포 전 환경변수와 마이그레이션을 점검하는 템플릿",
    price: 9000,
    stock: 50,
  },
];

for (const product of products) {
  const exists = await db.product.findFirst({
    where: { name: product.name },
    select: { id: true },
  });

  if (!exists) {
    await db.product.create({ data: product });
  }
}

await db.$disconnect();
console.log("Seeded shop products.");
