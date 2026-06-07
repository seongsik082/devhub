import type { OrderStatus } from "@prisma/client";

export const orderStatusLabels: Record<OrderStatus, string> = {
  PENDING: "주문 접수",
  PAID: "결제 완료",
  SHIPPED: "배송 중",
  CANCELLED: "취소",
};

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(value);
}
