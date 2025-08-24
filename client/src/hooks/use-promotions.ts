import { useQuery } from "@tanstack/react-query";
import type { Promotion, PromotionWithProduct } from "@shared/schema";

export function usePromotions(productId?: string) {
  const searchParams = new URLSearchParams();
  if (productId) searchParams.append("product_id", productId);

  return useQuery<{
    success: boolean;
    data: PromotionWithProduct[];
    error?: string;
  }>({
    queryKey: ["/api/promotions", searchParams.toString()],
    enabled: true,
  });
}

export function useActivePromotions() {
  return useQuery<{
    success: boolean;
    data: PromotionWithProduct[];
    error?: string;
  }>({
    queryKey: ["/api/promotions", "active"],
    enabled: true,
  });
}
