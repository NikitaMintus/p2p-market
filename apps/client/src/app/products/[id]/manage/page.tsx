"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import api from "../../../../lib/api"
import { Breadcrumbs } from "../../../../components/breadcrumbs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../../../components/ui/card"
import { Button } from "../../../../components/ui/button"
import { DeclineOfferDialog } from "../../../../components/decline-offer-dialog"

import { toast } from "sonner"

export default function ManageProductPage() {
    const { id } = useParams();
    const [product, setProduct] = useState<any>(null);
    const [offers, setOffers] = useState<any[]>([]);

    useEffect(() => {
        if(id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            const productRes = await api.get(`/products/${id}`);
            setProduct(productRes.data);

            const offersRes = await api.get(`/offers/product/${id}`);
            setOffers(offersRes.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load product details");
        }
    }

    const handleAccept = async (offerId: string) => {
        try {
            await api.patch(`/offers/${offerId}/accept`);
            toast.success("Offer accepted!");
            fetchData(); // Refresh data
        } catch (error) {
            console.error(error);
            toast.error("Failed to accept offer");
        }
    }

    const handleDecline = async (offerId: string) => {
        try {
            await api.patch(`/offers/${offerId}/decline`);
            toast.success("Offer declined");
            fetchData(); // Refresh data
        } catch (error) {
            console.error(error);
            toast.error("Failed to decline offer");
        }
    }

    if (!product) return <div>Loading...</div>

    return (
        <div className="space-y-8">
            <Breadcrumbs />
            <div>
                <h1 className="text-3xl font-bold">Manage: {product.title}</h1>
                <p className="text-muted-foreground">Status: {product.status}</p>
            </div>

            <section>
                <h2 className="text-xl font-semibold mb-4">Offers ({offers.length})</h2>
                {offers.length === 0 ? (
                    <p className="text-muted-foreground">No offers yet.</p>
                ) : (
                    <div className="space-y-4">
                        {offers.map((offer) => (
                            <Card key={offer.id}>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle>${Number(offer.amount).toFixed(2)}</CardTitle>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            offer.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                                            offer.status === 'DECLINED' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {offer.status}
                                        </span>
                                    </div>
                                    <CardDescription>From: {offer.buyer.name || 'User'}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p>Message: {offer.message || 'No message'}</p>
                                </CardContent>
                                {offer.status === 'PENDING' && product.status === 'ACTIVE' && (
                                    <CardFooter className="flex gap-2">
                                        <Button onClick={() => handleAccept(offer.id)} className="bg-green-600 hover:bg-green-700">Accept</Button>
                                        <DeclineOfferDialog onConfirm={() => handleDecline(offer.id)} />
                                    </CardFooter>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}

