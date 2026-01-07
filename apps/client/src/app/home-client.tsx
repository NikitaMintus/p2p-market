"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import Link from "next/link"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { ProductFilters } from "../components/product-filters"
import { useAuth } from "../context/auth-context"
import { getProductsClient } from "../lib/services/products/client"
import { Product, ProductParams } from "../lib/services/products/types"

interface HomeClientProps {
  initialProducts: Product[];
  initialFilters: ProductParams;
}

export default function HomeClient({ initialProducts, initialFilters }: HomeClientProps) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [search, setSearch] = useState(initialFilters.search || "")
  const [category, setCategory] = useState(initialFilters.category || "")
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice || "")
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice || "")
  const [sortBy, setSortBy] = useState(initialFilters.sort || "newest")
  const [cursor, setCursor] = useState<string | undefined>(
    initialProducts.length > 0 ? initialProducts[initialProducts.length - 1].id : undefined
  );
  const [hasMore, setHasMore] = useState(initialProducts.length >= 8);
  const [loading, setLoading] = useState(false);
  const isFirstRun = useRef(true);

  // Sync state to URL
  const updateUrl = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (search) params.set("search", search); else params.delete("search");
    if (category && category !== "ALL") params.set("category", category); else params.delete("category");
    if (minPrice) params.set("minPrice", minPrice); else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice); else params.delete("maxPrice");
    if (sortBy && sortBy !== "newest") params.set("sort", sortBy); else params.delete("sort");

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    // Skip the first run if we have initial products and no filters set
    // Also skip if the trigger is just user loading (unless filters are active)
    if (isFirstRun.current) {
        isFirstRun.current = false;
        return;
    }

    // Debounce fetch for 500ms
    const timer = setTimeout(() => {
      // Update URL
      updateUrl();

      // Reset list when filters change
      setProducts([]);
      setCursor(undefined);
      setHasMore(true);
      fetchProducts(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [search, category, minPrice, maxPrice, sortBy, user?.userId]);

  const fetchProducts = async (isReset = false) => {
    if (loading) return;
    if (!isReset && !hasMore) return;

    setLoading(true);
    try {
      const response = await getProductsClient({
        status: 'ACTIVE',
        take: 8,
        search: search || undefined,
        category: category || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        sort: sortBy || undefined,
        excludeSeller: user?.userId,
        cursor: (!isReset && cursor) ? cursor : undefined
      });
      
      const newData = response;
      const filteredData = newData;

      if (filteredData.length < 8) {
        setHasMore(false);
      }

      if (filteredData.length > 0) {
        // Update cursor to the last item's ID
        setCursor(filteredData[filteredData.length - 1].id);

        setProducts((prev) => {
          if (isReset) return filteredData;
          // Avoid duplicates just in case
          const existingIds = new Set(prev.map(l => l.id));
          const uniqueNewData = filteredData.filter((l: Product) => !existingIds.has(l.id));
          return [...prev, ...uniqueNewData];
        });
      } else if (isReset) {
        setProducts([]);
        setHasMore(false);
      }

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // Prevent default form submission but keep the form for semantic structure
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic handled by useEffect
  }

  const handleLoadMore = () => {
    fetchProducts(false);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <ProductFilters
        search={search}
        category={category}
        minPrice={minPrice}
        maxPrice={maxPrice}
        sortBy={sortBy}
        onSubmit={handleSubmit}
        onSearchChange={setSearch}
        onCategoryChange={setCategory}
        onMinPriceChange={setMinPrice}
        onMaxPriceChange={setMaxPrice}
        onSortChange={setSortBy}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <Link href={`/products/${product.id}`} className="block">
              <div className="aspect-square bg-muted relative">
                {/* Image placeholder or component */}
                {product.images && product.images.length > 0 ? (
                  <img src={product.images[0]} alt={product.title} className="object-cover w-full h-full" />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">No Image</div>
                )}
              </div>
            </Link>
            <CardHeader>
              <CardTitle className="truncate">
                <Link href={`/products/${product.id}`}>
                  {product.title}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-bold text-lg">${Number(product.price).toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">{product.condition} • {product.category}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Seller: {product.seller?.name || product.seller?.email || "Unknown"}
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/products/${product.id}`}>View Details</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {products.length === 0 && !loading && <p className="text-center text-muted-foreground mt-10">No items found.</p>}

      {hasMore && (
        <div className="flex justify-center mt-8">
          <Button onClick={handleLoadMore} disabled={loading}>
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  )
}
