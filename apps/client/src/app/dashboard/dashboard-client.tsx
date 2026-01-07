"use client"

import { useState } from "react"
import api from "../../lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import Link from "next/link"
import { toast } from "sonner"
import { Eye, Edit, Trash2, Gavel, PlusCircle, ShoppingBag, ChevronDown, ChevronUp } from "lucide-react"
import { useRouter } from "next/navigation"

interface DashboardClientProps {
  initialProducts: any[];
  initialTransactions: any[];
  userId: string;
}

export default function DashboardClient({ initialProducts, initialTransactions, userId }: DashboardClientProps) {
    const [myProducts, setMyProducts] = useState<any[]>(initialProducts);
    const [transactions] = useState<any[]>(initialTransactions);
    const [isCompletedOpen, setIsCompletedOpen] = useState(false);
    
    // Split transactions
    const activeTransactions = transactions.filter(tx => !['COMPLETED', 'CANCELLED', 'DECLINED'].includes(tx.status));
    const completedTransactions = transactions.filter(tx => ['COMPLETED', 'CANCELLED', 'DECLINED'].includes(tx.status));

    const [isActiveOpen, setIsActiveOpen] = useState(true);
    const [isProductsOpen, setIsProductsOpen] = useState(true);

    const router = useRouter();
    
    const handleDeleteProduct = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            await api.delete(`/products/${id}`);
            toast.success("Product deleted successfully");
            // Optimistically update the UI
            setMyProducts((prev) => prev.filter((item) => item.id !== id));
            // Refresh server data
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete product");
        }
    }

    const getPendingOffersCount = (product: any) => {
        if (!product?.offers) return 0;
        return product.offers.filter((offer: any) => offer.status === "PENDING").length;
    }

    const getPendingOffersBadge = (product: any) => {
        const pendingCount = getPendingOffersCount(product);
        if (pendingCount <= 0) return null;
        return (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border bg-yellow-100 text-gray-800 border-yellow-200">
                PENDING OFFERS: {pendingCount}
            </span>
        );
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            ACTIVE: "bg-green-100 text-green-800 border-green-200",
            SOLD: "bg-blue-100 text-blue-800 border-blue-200",
            DRAFT: "bg-gray-100 text-gray-800 border-gray-200",
            EXPIRED: "bg-red-100 text-red-800 border-red-200",
            COMPLETED: "bg-purple-100 text-purple-800 border-purple-200",
            PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
        };
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || "bg-gray-100 text-gray-800"}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Manage your products and track your transactions.</p>
                </div>
                <div className="flex gap-3">
                    <Button asChild variant="outline" className="gap-2">
                        <Link href="/dashboard/offers">
                            <ShoppingBag className="w-4 h-4" />
                            My Offers
                        </Link>
                    </Button>
                    <Button asChild className="gap-2 shadow-sm">
                        <Link href="/products/create">
                            <PlusCircle className="w-4 h-4" />
                            New Product
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Active Transactions */}
            <section className="mt-4">
                <button 
                    onClick={() => setIsActiveOpen(!isActiveOpen)}
                    className="flex items-center gap-2 w-full text-left group"
                >
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 group-hover:text-primary transition-colors">
                        Active Transactions
                        <span className="text-sm font-normal text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                            {activeTransactions.length}
                        </span>
                        {isActiveOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </h2>
                </button>
                
                {isActiveOpen && (
                    <>
                        {activeTransactions.length === 0 ? (
                            <div className="text-center py-12 border rounded-xl bg-muted/20 border-dashed mb-6">
                                <p className="text-muted-foreground">No active transactions at the moment.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2 duration-300 mb-6">
                                {activeTransactions.map((tx) => {
                                    const isBuyer = tx.buyerId === userId;
                                    const product = tx.offer?.product;
                                    return (
                                        <Card key={tx.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                            <div className="flex h-32 bg-muted relative">
                                                {product?.images && product.images.length > 0 ? (
                                                    <img 
                                                        src={product.images[0]} 
                                                        alt={product.title} 
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                        Product unavailable
                                                    </div>
                                                )}
                                                <div className="absolute top-2 right-2">
                                                    {getStatusBadge(tx.status)}
                                                </div>
                                                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                                    {isBuyer ? "You are Buying" : "You are Selling"}
                                                </div>
                                            </div>
                                            <CardHeader className="pb-3">
                                                <CardTitle className="truncate">{product?.title ?? 'Product unavailable'}</CardTitle>
                                                <CardDescription>
                                                    {isBuyer ? `Seller: ${tx.seller.name || 'Unknown'}` : `Buyer: ${tx.buyer.name || 'Unknown'}`}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardFooter>
                                                <Button asChild variant="secondary" className="w-full">
                                                    <Link href={`/dashboard/transactions/${tx.id}`}>Manage Transaction</Link>
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* Completed Transactions */}
            {completedTransactions.length > 0 && (
                <section>
                    <button 
                        onClick={() => setIsCompletedOpen(!isCompletedOpen)}
                        className="flex items-center gap-2 w-full text-left group"
                    >
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 group-hover:text-primary transition-colors">
                            Completed Transactions
                            <span className="text-sm font-normal text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                                {completedTransactions.length}
                            </span>
                            {isCompletedOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </h2>
                    </button>
                    
                    {isCompletedOpen && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2 duration-300 mb-6">
                            {completedTransactions.map((tx) => {
                                const isBuyer = tx.buyerId === userId;
                                const product = tx.offer?.product;
                                return (
                                    <Card key={tx.id} className="overflow-hidden opacity-75 hover:opacity-100 transition-opacity bg-muted/30">
                                        <div className="flex h-32 bg-muted relative grayscale">
                                            {product?.images && product.images.length > 0 ? (
                                                <img 
                                                    src={product.images[0]} 
                                                    alt={product.title} 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                    Product unavailable
                                                </div>
                                            )}
                                            <div className="absolute top-2 right-2">
                                                {getStatusBadge(tx.status)}
                                            </div>
                                            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                                {isBuyer ? "You were Buyer" : "You were Seller"}
                                            </div>
                                        </div>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="truncate text-muted-foreground">{product?.title ?? 'Product unavailable'}</CardTitle>
                                            <CardDescription>
                                                {isBuyer ? `Seller: ${tx.seller.name || 'Unknown'}` : `Buyer: ${tx.buyer.name || 'Unknown'}`}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardFooter>
                                            <Button asChild variant="outline" className="w-full">
                                                <Link href={`/dashboard/transactions/${tx.id}`}>View Details</Link>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </section>
            )}
            
            {/* My Products */}
            <section>
                <button 
                    onClick={() => setIsProductsOpen(!isProductsOpen)}
                    className="flex items-center gap-2 w-full text-left group"
                >
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 group-hover:text-primary transition-colors">
                        My Products
                        <span className="text-sm font-normal text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                            {myProducts.length}
                        </span>
                        {isProductsOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </h2>
                </button>
                
                {isProductsOpen && (
                    <>
                        {myProducts.length === 0 ? (
                            <div className="text-center py-16 border rounded-xl bg-muted/20 border-dashed mb-6">
                                <h3 className="text-lg font-medium">No products yet</h3>
                                <p className="text-muted-foreground mt-2 mb-6">Start selling your items today!</p>
                                <Button asChild>
                                    <Link href="/products/create">Create Your First Product</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-2 duration-300 mb-6">
                                  {myProducts.map((product) => (
                                    <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                                        <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                                             {product.images && product.images.length > 0 ? (
                                                <img 
                                                    src={product.images[0]} 
                                                    alt={product.title} 
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-secondary">
                                                    No Image
                                                </div>
                                            )}
                                            <div className="absolute top-2 right-2 flex flex-col items-end gap-2">
                                                {getStatusBadge(product.status)}
                                                {getPendingOffersBadge(product)}
                                            </div>
                                        </div>
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <CardTitle className="truncate text-lg" title={product.title}>{product.title}</CardTitle>
                                            </div>
                                            <CardDescription className="font-semibold text-primary text-lg">
                                                ${Number(product.price).toFixed(2)}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="pb-4">
                                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                <span className="truncate">{product.category}</span>
                                                <span>•</span>
                                                <span>{product.condition}</span>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="grid grid-cols-4 gap-2 pt-0">
                                            <Button
                                                asChild
                                                variant="ghost"
                                                size="icon"
                                                className="col-span-1 w-full h-9"
                                                title="View Public Page"
                                            >
                                                <Link href={`/products/${product.id}`} aria-label="View Public Page">
                                                    <Eye className="w-4 h-4 text-muted-foreground" />
                                                </Link>
                                            </Button>
                                            <Button
                                                asChild
                                                variant="ghost"
                                                size="icon"
                                                className="col-span-1 w-full h-9"
                                                title="Manage Offers"
                                            >
                                                 <Link href={`/products/${product.id}/manage`} aria-label="Manage Offers">
                                                    <Gavel className="w-4 h-4 text-blue-600" />
                                                 </Link>
                                            </Button>
                                            <Button
                                                asChild
                                                variant="ghost"
                                                size="icon"
                                                className="col-span-1 w-full h-9"
                                                title="Edit Product"
                                            >
                                                 <Link href={`/products/${product.id}/edit`} aria-label="Edit Product">
                                                    <Edit className="w-4 h-4 text-orange-600" />
                                                 </Link>
                                            </Button>
                                            <div className="col-span-1">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="w-full h-9 hover:bg-red-50 hover:text-red-600" 
                                                    onClick={() => handleDeleteProduct(product.id)}
                                                    title="Delete Product"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </section>
        </div>
    )
}
