import { getServerUser } from "../lib/auth/session";
import HomeClient from "./home-client";
import { getProductsServer } from "../lib/services/products/server";
import { Product, ProductParams } from "../lib/services/products/types";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: PageProps) {
  let products: Product[] = [];
  let user: any = null;

  // Await searchParams in Next.js 15+
  const resolvedParams = await searchParams;

  const filters: ProductParams = {
    search: typeof resolvedParams.search === 'string' ? resolvedParams.search : undefined,
    category: typeof resolvedParams.category === 'string' ? resolvedParams.category : undefined,
    minPrice: typeof resolvedParams.minPrice === 'string' ? resolvedParams.minPrice : undefined,
    maxPrice: typeof resolvedParams.maxPrice === 'string' ? resolvedParams.maxPrice : undefined,
    sort: typeof resolvedParams.sort === 'string' ? resolvedParams.sort : undefined,
    status: 'ACTIVE',
    take: 8,
  };

  try {
    // 1. Get user first to determine filter
    user = await getServerUser().catch(() => null);
    
    // 2. Fetch products with filter applied on server
    products = await getProductsServer({ 
      ...filters,
      excludeSeller: user?.userId
    });

  } catch (error) {
    console.error("Home Page SSR Error:", error);
    products = [];
  }

  return <HomeClient initialProducts={products} initialFilters={filters} />;
}
