import api from "../../api";
import { Product, ProductParams } from "./types";

export async function getProductsClient(params: ProductParams = {}) {
  const queryParams: any = { ...params };
  
  // Clean up params for axios
  if (queryParams.category === "ALL") delete queryParams.category;
  
  const response = await api.get('/products', { params: queryParams });
  return response.data as Product[];
}

