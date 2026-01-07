"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import api from "../../../lib/api"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Textarea } from "../../../components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../components/ui/dialog"
import { useAuth } from "../../../context/auth-context"
import { toast } from "sonner"

interface ProductDetailClientProps {
  product: any;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const pathname = usePathname()
  const { isAuthenticated, openAuthModal } = useAuth()
  const [offerAmount, setOfferAmount] = useState("")
  const [offerMessage, setOfferMessage] = useState("")
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false)

  const handleMakeOffer = async () => {
    if (!isAuthenticated) {
      const redirectTarget = pathname || `/products/${product.id}`
      openAuthModal("login", redirectTarget)
      return;
    }
    try {
      await api.post("/offers", {
        productId: product.id,
        amount: Number(offerAmount),
        message: offerMessage
      })
      setIsOfferDialogOpen(false)
      toast.success("Offer sent successfully!")
      setOfferAmount("")
      setOfferMessage("")
      // Optional: Force refresh or update local state if we want to show "Offer Sent"
    } catch (error) {
      console.error(error)
      toast.error("Failed to send offer. Make sure you are logged in and not the seller.")
    }
  }

  const handleOfferClick = () => {
    if (!isAuthenticated) {
      const redirectTarget = pathname || `/products/${product.id}`
      openAuthModal("login", redirectTarget)
      return;
    }
    setIsOfferDialogOpen(true);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
      <div className="aspect-square bg-muted rounded-lg overflow-hidden relative">
          {product.images && product.images.length > 0 ? (
            <img src={product.images[0]} alt={product.title} className="object-cover w-full h-full" />
          ) : (
             <div className="flex items-center justify-center h-full text-muted-foreground">No Image</div>
          )}
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{product.title}</h1>
          <p className="text-xl font-semibold mt-2">${Number(product.price).toFixed(2)}</p>
          <div className="flex gap-2 mt-2">
            <span className="bg-secondary px-2 py-1 rounded text-sm">{product.condition}</span>
            <span className="bg-secondary px-2 py-1 rounded text-sm">{product.category}</span>
          </div>
        </div>

        <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{product.description}</p>
        </div>
        
        <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-4">Seller: {product.seller?.name || product.seller?.email}</p>
            
            {product.status === 'ACTIVE' && (
                <>
                    <Button className="w-full md:w-auto" onClick={handleOfferClick}>Make an Offer</Button>
                    <Dialog open={isOfferDialogOpen} onOpenChange={setIsOfferDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                        <DialogTitle>Make an Offer</DialogTitle>
                        <DialogDescription>
                            Enter your offer amount for {product.title}.
                        </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Amount ($)</label>
                                <Input 
                                    type="number" 
                                    value={offerAmount} 
                                    onChange={(e) => setOfferAmount(e.target.value)}
                                    placeholder={`Asking price: $${product.price}`}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Message (Optional)</label>
                                <Textarea 
                                    value={offerMessage} 
                                    onChange={(e) => setOfferMessage(e.target.value)}
                                    placeholder="I'm interested in this item..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                        <Button onClick={handleMakeOffer}>Submit Offer</Button>
                        </DialogFooter>
                    </DialogContent>
                    </Dialog>
                </>
            )}
            {product.status !== 'ACTIVE' && (
                <Button disabled className="w-full md:w-auto">Item {product.status}</Button>
            )}
        </div>
      </div>
    </div>
  )
}

