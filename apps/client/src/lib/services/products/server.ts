import { fetchServer } from "../../api-server";
import { Product, ProductParams } from "./types";

export async function getProductsServer(params: ProductParams = {}) {
  const queryParams: Record<string, string> = {};
  
  if (params.status) queryParams.status = params.status;
  if (params.take) queryParams.take = String(params.take);
  if (params.search) queryParams.search = params.search;
  if (params.category && params.category !== "ALL") queryParams.category = params.category;
  if (params.minPrice) queryParams.minPrice = params.minPrice;
  if (params.maxPrice) queryParams.maxPrice = params.maxPrice;
  if (params.sort) queryParams.sort = params.sort;
  if (params.excludeSeller) queryParams.excludeSeller = params.excludeSeller;
  if (params.cursor) queryParams.cursor = params.cursor;

  return fetchServer<Product[]>('/products', { 
    params: queryParams,
    cache: 'no-store' 
  });
}

