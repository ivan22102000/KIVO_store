import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";

export function useProducts(params?: {
  search?: string;
  category?: string;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  
  if (params?.search) searchParams.append("search", params.search);
  if (params?.category) searchParams.append("category", params.category);
  if (params?.limit) searchParams.append("limit", params.limit.toString());

  return useQuery<{
    success: boolean;
    data: Product[];
    error?: string;
  }>({
    queryKey: ["/api/products", searchParams.toString()],
    enabled: true,
  });
}

export function useProduct(id: string) {
  return useQuery<{
    success: boolean;
    data: Product;
    error?: string;
  }>({
    queryKey: ["/api/products", id],
    enabled: !!id,
  });
}
