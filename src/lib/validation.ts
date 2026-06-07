import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "이름은 2자 이상이어야 합니다.").max(40),
    email: z.string().trim().email("올바른 이메일을 입력해주세요.").toLowerCase(),
    password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다.").max(80),
    confirmPassword: z.string().min(1, "비밀번호 확인을 입력해주세요."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 서로 일치하지 않습니다.",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().trim().email("올바른 이메일을 입력해주세요.").toLowerCase(),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

export const findIdSchema = z.object({
  name: z.string().trim().min(2, "이름은 2자 이상이어야 합니다.").max(40),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "현재 비밀번호를 입력해주세요."),
    newPassword: z.string().min(8, "새 비밀번호는 8자 이상이어야 합니다.").max(80),
    confirmPassword: z.string().min(1, "새 비밀번호 확인을 입력해주세요."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "새 비밀번호가 서로 일치하지 않습니다.",
    path: ["confirmPassword"],
  });

export const postSchema = z.object({
  title: z.string().trim().min(2, "제목은 2자 이상이어야 합니다.").max(120),
  content: z.string().trim().min(10, "본문은 10자 이상이어야 합니다.").max(8000),
});

export const commentSchema = z.object({
  content: z.string().trim().min(2, "댓글은 2자 이상이어야 합니다.").max(1000),
});

export const todoProjectSchema = z.object({
  name: z.string().trim().min(2, "프로젝트 이름은 2자 이상이어야 합니다.").max(80),
  description: z.string().trim().max(500).optional().or(z.literal("")),
});

export const todoTaskSchema = z.object({
  title: z.string().trim().min(2, "할 일 제목은 2자 이상이어야 합니다.").max(120),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
});

export const taskStatusSchema = z.object({
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
});

export const adminRoleSchema = z.object({
  role: z.enum(["USER", "ADMIN"]),
});

export const adminPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "새 비밀번호는 8자 이상이어야 합니다.").max(80),
    confirmPassword: z.string().min(1, "새 비밀번호 확인을 입력해주세요."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "새 비밀번호가 서로 일치하지 않습니다.",
    path: ["confirmPassword"],
  });

export const productSchema = z.object({
  name: z.string().trim().min(2, "상품명은 2자 이상이어야 합니다.").max(80),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  price: z.coerce.number().int().min(100, "가격은 100원 이상이어야 합니다.").max(10000000),
  stock: z.coerce.number().int().min(0, "재고는 0개 이상이어야 합니다.").max(100000),
  isActive: z.coerce.boolean().optional().default(true),
});

export const cartSchema = z.object({
  productId: z.string().min(1, "상품을 선택해주세요."),
  quantity: z.coerce.number().int().min(1, "수량은 1개 이상이어야 합니다.").max(99),
});

export const cartQuantitySchema = z.object({
  quantity: z.coerce.number().int().min(1, "수량은 1개 이상이어야 합니다.").max(99),
});

export const adminOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "SHIPPED", "CANCELLED"]),
});
