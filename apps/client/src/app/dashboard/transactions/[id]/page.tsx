"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import api from "../../../../lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card"
import { Button } from "../../../../components/ui/button"
import { useAuth } from "../../../../context/auth-context"
import { useNotification } from "../../../../context/notification-context"
import { toast } from "sonner"
import { CheckCircle2, CreditCard, Truck, Package, Flag, AlertTriangle, XCircle, Clock, MapPin } from "lucide-react"

// Define steps with metadata for better UI rendering
const STEPS = [
    { id: 'OFFER_ACCEPTED', label: 'Offer Accepted', icon: CheckCircle2 },
    { id: 'PAYMENT_PENDING', label: 'Payment Pending', icon: Clock },
    { id: 'PAID', label: 'Paid', icon: CreditCard },
    { id: 'SHIPPED', label: 'Shipped', icon: Truck },
    { id: 'DELIVERED', label: 'Delivered', icon: Package },
    { id: 'COMPLETED', label: 'Completed', icon: CheckCircle2 }
];

export default function TransactionPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { socket } = useNotification();
    const [transaction, setTransaction] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(id) fetchTransaction();
    }, [id]);

    useEffect(() => {
        if (!socket) return;

        const handleNotification = (data: any) => {
            if (data.type === 'TRANSACTION_UPDATE' && data.transactionId === id) {
                setTransaction((prev: any) => {
                    if (!prev) return prev;
                    return { ...prev, status: data.status };
                });
                toast.info("Transaction status updated");
            }
        };

        socket.on('notification', handleNotification);

        return () => {
            socket.off('notification', handleNotification);
        };
    }, [socket, id]);

    const fetchTransaction = async () => {
        try {
            const res = await api.get(`/transactions/${id}`);
            setTransaction(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load transaction details");
        } finally {
            setLoading(false);
        }
    }

    const updateStatus = async (status: string) => {
        try {
            await api.patch(`/transactions/${id}/status`, { status });
            toast.success(`Status updated to ${status.replace('_', ' ')}`);
            fetchTransaction();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update status");
        }
    }

    // Skeleton Loader
    if (loading) {
        return (
            <div className="max-w-5xl mx-auto p-4 space-y-6">
                <div className="h-10 w-1/3 bg-muted animate-pulse rounded" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 h-96 bg-muted animate-pulse rounded-lg" />
                    <div className="h-96 bg-muted animate-pulse rounded-lg" />
                </div>
            </div>
        );
    }

    if (!transaction || !user) return <div>Transaction not found</div>;

    const isBuyer = user.userId === transaction.buyerId;
    const isSeller = user.userId === transaction.sellerId;
    const product = transaction.offer?.product;
    
    // Determine current step index. Handle edge cases like DISPUTED separately.
    let currentStepIndex = STEPS.findIndex(s => s.id === transaction.status);
    const isDisputed = transaction.status === 'DISPUTED';
    const isCancelled = transaction.status === 'CANCELLED';

    if (isDisputed || isCancelled) {
        currentStepIndex = -1; // Hide from linear stepper or handle specially
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Transaction Details</h1>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                        <span className="font-mono text-xs bg-muted px-2 py-1 rounded">ID: {transaction.id.split('-')[0]}...</span>
                        <span>•</span>
                        <span>{new Date(transaction.createdAt).toLocaleDateString()}</span>
                    </p>
                </div>
                <div className="px-3 py-1 bg-secondary rounded-full text-sm font-medium">
                    {isBuyer ? "You are the Buyer" : "You are the Seller"}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Progress & Actions */}
                <div className="md:col-span-2 space-y-6">
                    
                    {/* Status Alert for Edge Cases */}
                    {(isDisputed || isCancelled) && (
                        <div className={`p-4 rounded-lg border flex items-center gap-4 ${
                            isDisputed ? 'bg-red-50 border-red-200 text-red-800' : 'bg-gray-50 border-gray-200 text-gray-800'
                        }`}>
                            {isDisputed ? <AlertTriangle className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                            <div>
                                <h3 className="font-bold text-lg">{isDisputed ? 'Transaction Disputed' : 'Transaction Cancelled'}</h3>
                                <p className="text-sm opacity-90">
                                    {isDisputed 
                                        ? 'A dispute has been reported. Support team will review this case.' 
                                        : 'This transaction has been cancelled.'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Stepper */}
                    {!isDisputed && !isCancelled && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Progress</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="relative flex flex-col gap-0">
                                    {STEPS.map((step, index) => {
                                        const isCompleted = index <= currentStepIndex;
                                        const isCurrent = index === currentStepIndex;
                                        const Icon = step.icon;
                                        const isLast = index === STEPS.length - 1;
                                        
                                        return (
                                            <div key={step.id} className="flex gap-4 relative pb-8 last:pb-0">
                                                {/* Connecting Line */}
                                                {!isLast && (
                                                    <div className={`absolute left-[15px] top-8 w-0.5 h-[calc(100%-8px)] -z-10 ${
                                                        index < currentStepIndex ? 'bg-primary' : 'bg-muted'
                                                    }`} />
                                                )}
                                                
                                                {/* Icon Bubble */}
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 bg-background z-10 transition-colors duration-300 ${
                                                    isCompleted 
                                                        ? 'border-primary text-primary' 
                                                        : 'border-muted text-muted-foreground'
                                                } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>

                                                {/* Text Content */}
                                                <div className={`flex-1 pt-1 ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                    <p className="font-medium leading-none">{step.label}</p>
                                                    {isCurrent && (
                                                        <p className="text-xs text-primary mt-1 font-medium animate-pulse">
                                                            Current Stage
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Action Panel */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Actions</CardTitle>
                            <CardDescription>Update the status of this transaction as it progresses.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-3">
                            {/* Buyer Actions */}
                            {isBuyer && transaction.status === 'OFFER_ACCEPTED' && (
                                <Button onClick={() => updateStatus('PAID')} className="w-full sm:w-auto">
                                    <CreditCard className="mr-2 h-4 w-4" /> Mark as Paid
                                </Button>
                            )}
                            {isBuyer && transaction.status === 'SHIPPED' && (
                                <Button onClick={() => updateStatus('DELIVERED')} className="w-full sm:w-auto">
                                    <Package className="mr-2 h-4 w-4" /> Confirm Delivery
                                </Button>
                            )}
                            {isBuyer && transaction.status === 'DELIVERED' && (
                                <Button onClick={() => updateStatus('COMPLETED')} variant="default" className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Complete Transaction
                                </Button>
                            )}

                            {/* Seller Actions */}
                            {isSeller && transaction.status === 'PAID' && (
                                <Button onClick={() => updateStatus('SHIPPED')} className="w-full sm:w-auto">
                                    <Truck className="mr-2 h-4 w-4" /> Mark as Shipped
                                </Button>
                            )}
                            
                            {/* Common Actions */}
                            {!['COMPLETED', 'CANCELLED', 'DISPUTED'].includes(transaction.status) && (
                                <Button variant="destructive" onClick={() => updateStatus('DISPUTED')} className="ml-auto w-full sm:w-auto">
                                    <Flag className="mr-2 h-4 w-4" /> Report Issue
                                </Button>
                            )}
                            
                            {/* Empty State */}
                            {['COMPLETED', 'CANCELLED', 'DISPUTED'].includes(transaction.status) && (
                                <div className="text-center w-full py-4 bg-muted/20 rounded-lg">
                                    <p className="text-muted-foreground italic">No further actions available for this transaction.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Item Info */}
                <div className="space-y-6">
                    <Card className="overflow-hidden sticky top-24">
                        <div className="aspect-square bg-muted relative">
                             {product?.images && product.images.length > 0 ? (
                                <img 
                                    src={product.images[0]} 
                                    alt={product.title ?? 'Product image'} 
                                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">No Image</div>
                            )}
                        </div>
                        <CardHeader>
                            <CardTitle className="text-xl">{product?.title ?? 'Product unavailable'}</CardTitle>
                            <CardDescription>
                                {product ? `${product.category} • ${product.condition}` : 'Product details unavailable'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {product && (
                              <div className="text-3xl font-bold text-primary border-b pb-4">
                                  ${Number(transaction.offer?.amount).toFixed(2)}
                              </div>
                            )}
                            
                            <div className="space-y-4 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Seller</span>
                                    <span className="font-medium truncate max-w-[150px]">{transaction.seller.name || transaction.seller.email}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Buyer</span>
                                    <span className="font-medium truncate max-w-[150px]">{transaction.buyer.name || transaction.buyer.email}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Started</span>
                                    <span className="font-medium">{new Date(transaction.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {transaction.status === 'SHIPPED' && (
                                <div className="bg-blue-50 p-3 rounded-md text-blue-800 text-sm flex gap-2">
                                    <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                                    <p>Item is on its way! Check status updates.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
