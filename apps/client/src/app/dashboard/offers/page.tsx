"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import api from "../../../lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { DeclineOfferDialog } from "../../../components/decline-offer-dialog"
import Link from "next/link"
import { toast } from "sonner"

export default function MyOffersPage() {
    const router = useRouter();
    const [offers, setOffers] = useState<any[]>([]);
    const [viewMode, setViewMode] = useState<'outgoing' | 'incoming'>('incoming');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setOffers([]); // Clear items when switching views to prevent schema mismatch
        fetchOffers();
    }, [viewMode]);

    const fetchOffers = async () => {
        setLoading(true);
        try {
            const endpoint = viewMode === 'outgoing' ? '/offers/my-offers' : '/offers/incoming';
            const response = await api.get(endpoint);
            setOffers(response.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load offers");
        } finally {
            setLoading(false);
        }
    }

    const handleWithdraw = async (offerId: string) => {
        try {
            await api.patch(`/offers/${offerId}/withdraw`);
            toast.success("Offer withdrawn successfully");
            fetchOffers();
        } catch (error) {
            console.error(error);
            toast.error("Failed to withdraw offer");
        }
    }

    const handleAccept = async (offerId: string) => {
        try {
            const response = await api.patch(`/offers/${offerId}/accept`);
            toast.success("Offer accepted!");
            debugger
            if (response.data?.transactionId) {
                router.push(`/dashboard/transactions/${response.data.transactionId}`);
            } else {
                fetchOffers();
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to accept offer");
        }
    }

    const handleDecline = async (offerId: string) => {
        try {
            await api.patch(`/offers/${offerId}/decline`);
            toast.success("Offer declined");
            fetchOffers();
        } catch (error) {
            console.error(error);
            toast.error("Failed to decline offer");
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACCEPTED': return 'text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs border border-green-200';
            case 'DECLINED': return 'text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs border border-red-200';
            case 'WITHDRAWN': return 'text-gray-500 bg-gray-50 px-2 py-1 rounded-full text-xs border border-gray-200';
            case 'PENDING': return 'text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full text-xs border border-yellow-200';
            default: return 'text-gray-600';
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Offers</h1>
                    <p className="text-muted-foreground mt-2">Manage your incoming and outgoing offers.</p>
                </div>
                <div className="flex bg-secondary p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('outgoing')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            viewMode === 'outgoing' 
                                ? 'bg-background shadow text-foreground' 
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        Sent Offers
                    </button>
                    <button
                        onClick={() => setViewMode('incoming')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            viewMode === 'incoming' 
                                ? 'bg-background shadow text-foreground' 
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        Received Offers
                    </button>
                </div>
            </div>
            
            {loading ? (
                <div className="flex justify-center p-8">Loading offers...</div>
            ) : offers.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-muted/20 border-dashed">
                    <p className="text-muted-foreground text-lg">
                        {viewMode === 'outgoing' ? "You haven't made any offers yet." : "No offers received yet."}
                    </p>
                    {viewMode === 'outgoing' && (
                        <Button asChild className="mt-4">
                            <Link href="/">Browse Products</Link>
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {offers.map((offer) => (
                        <Card key={offer.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200 flex flex-col">
                            <div className="aspect-video bg-muted relative">
                                {offer.product.images && offer.product.images.length > 0 ? (
                                    <img 
                                        src={offer.product.images[0]} 
                                        alt={offer.product.title} 
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground bg-secondary">
                                        No Image
                                    </div>
                                )}
                                <div className="absolute top-2 right-2">
                                    <span className={getStatusColor(offer.status)}>{offer.status}</span>
                                </div>
                            </div>
                            <CardHeader>
                                <CardTitle className="truncate hover:underline cursor-pointer">
                                    <Link href={`/products/${offer.product.id}`}>
                                        {offer.product.title}
                                    </Link>
                                </CardTitle>
                                <CardDescription>
                                    {viewMode === 'outgoing' 
                                        ? `Offered on ${new Date(offer.createdAt).toLocaleDateString()}`
                                        : `From: ${offer.buyer?.name || offer.buyer?.email || 'Unknown User'}`
                                    }
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4">
                                <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                                    <span className="text-sm font-medium">Offer Amount</span>
                                    <span className="text-lg font-bold text-primary">${Number(offer.amount).toFixed(2)}</span>
                                </div>
                                {offer.message && (
                                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md italic">
                                        "{offer.message}"
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="flex gap-2 pt-4 border-t">
                                <Button asChild variant="outline" className="flex-1">
                                    <Link href={`/products/${offer.product.id}`}>View Item</Link>
                                </Button>
                                
                                {viewMode === 'outgoing' && offer.status === 'PENDING' && (
                                    <Button 
                                        variant="destructive" 
                                        onClick={() => handleWithdraw(offer.id)}
                                        className="flex-1"
                                    >
                                        Withdraw
                                    </Button>
                                )}

                                {viewMode === 'incoming' && offer.status === 'PENDING' && (
                                    <>
                                        <Button 
                                            variant="default"
                                            className="flex-1 bg-green-600 hover:bg-green-700"
                                            onClick={() => handleAccept(offer.id)}
                                        >
                                            Accept
                                        </Button>
                                        <DeclineOfferDialog 
                                            onConfirm={() => handleDecline(offer.id)}
                                            trigger={
                                                <Button 
                                                    variant="destructive"
                                                    className="flex-1"
                                                >
                                                    Decline
                                                </Button>
                                            }
                                        />
                                    </>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
