"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "./ui/dialog"
import { Button } from "./ui/button"

interface DeclineOfferDialogProps {
  onConfirm: () => void;
  trigger?: React.ReactNode;
}

export function DeclineOfferDialog({ onConfirm, trigger }: DeclineOfferDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || <Button variant="destructive">Decline</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Decline Offer</DialogTitle>
          <DialogDescription>
            Are you sure you want to decline this offer? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">No, Cancel</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={onConfirm}
          >
            Yes, Decline
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

