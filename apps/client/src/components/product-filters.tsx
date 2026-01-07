"use client"

import { FormEvent, useState } from "react"
import { Filter } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

interface ProductFiltersProps {
  search: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  sortBy: string;
  onSubmit: (event: FormEvent) => void;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onSortChange: (value: string) => void;
}

export function ProductFilters({
  search,
  category,
  minPrice,
  maxPrice,
  sortBy,
  onSubmit,
  onSearchChange,
  onCategoryChange,
  onMinPriceChange,
  onMaxPriceChange,
  onSortChange,
}: ProductFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderForm = () => (
    <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
      <div className="space-y-2">
        <label className="text-sm font-medium">Search</label>
        <Input type="text" placeholder="Search items..." value={search} onChange={(e) => onSearchChange(e.target.value)} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <Select onValueChange={onCategoryChange} value={category}>
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            <SelectItem value="Electronics">Electronics</SelectItem>
            <SelectItem value="Clothing">Clothing</SelectItem>
            <SelectItem value="Home">Home</SelectItem>
            <SelectItem value="Toys">Toys</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Price Range</label>
        <div className="flex gap-2">
          <Input type="number" placeholder="Min" value={minPrice} onChange={(e) => onMinPriceChange(e.target.value)} />
          <Input type="number" placeholder="Max" value={maxPrice} onChange={(e) => onMaxPriceChange(e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Sort By</label>
        <Select onValueChange={onSortChange} value={sortBy}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <button type="submit" className="hidden" />
    </form>
  );

  return (
    <>
      <div className="md:hidden">
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-expanded={mobileOpen}
          aria-controls="product-filters-mobile"
        >
          <Filter className="h-4 w-4" />
          {mobileOpen ? "Hide Filters" : "Filters"}
        </Button>
        {mobileOpen && (
          <div id="product-filters-mobile" className="mt-3 flex flex-col gap-4 bg-secondary/20 p-4 rounded-lg">
            {renderForm()}
          </div>
        )}
      </div>

      <div className="hidden md:flex flex-col gap-4 bg-secondary/20 p-4 rounded-lg">
        {renderForm()}
      </div>
    </>
  )
}

