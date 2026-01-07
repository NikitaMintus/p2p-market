export interface ProductParams {
  page?: number;
  take?: number;
  cursor?: string;
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  status?: string;
  excludeSeller?: string;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  condition: string;
  images: string[];
  seller?: {
    id?: string;
    name?: string;
    email?: string;
  };
}

