import { notFound } from "next/navigation";
import { fetchServer } from "../../../lib/api-server";
import ProductDetailClient from "./product-detail-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;

  try {
    const product = await fetchServer<any>(`/products/${id}`, {
      cache: 'no-store' // Ensure fresh data
    });

    if (!product) {
      console.warn(`Product ${id} returned null/undefined`);
      notFound();
    }

    return <ProductDetailClient product={product} />;
  } catch (error) {
    console.error(`Product Detail SSR Error for ID ${id}:`, error);
    notFound();
  }
}

