"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "../../../../components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../../components/ui/form"
import { Input } from "../../../../components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select"
import { Textarea } from "../../../../components/ui/textarea"
import api from "../../../../lib/api"
import { useRouter, useParams } from "next/navigation"
import { Breadcrumbs } from "../../../../components/breadcrumbs"

const editProductSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  price: z.coerce.number().min(0),
  category: z.string().min(1),
  condition: z.enum(["NEW", "LIKE_NEW", "GOOD", "FAIR", "POOR"]),
  status: z.enum(["ACTIVE", "DRAFT", "SOLD", "EXPIRED"]),
  imageUrl: z.string().url().optional().or(z.literal("")),
})

// Define type explicitly to match schema output
type EditProductValues = z.infer<typeof editProductSchema>;

export default function EditProductPage() {
  const router = useRouter()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)

  // @ts-ignore - zodResolver types mismatch with complex schema occasionally
  const form = useForm<EditProductValues>({
    resolver: zodResolver(editProductSchema) as any, // Force cast to avoid strict type check on resolver mismatch
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      category: "",
      condition: "GOOD",
      status: "ACTIVE",
      imageUrl: "",
    },
  })

  useEffect(() => {
      if (id) {
          fetchProduct();
      }
  }, [id]);

  const fetchProduct = async () => {
      try {
          const response = await api.get(`/products/${id}`);
          const data = response.data;
          form.reset({
              title: data.title,
              description: data.description,
              price: data.price,
              category: data.category,
              condition: data.condition,
              status: data.status,
              imageUrl: data.images && data.images.length > 0 ? data.images[0] : "",
          });
      } catch (error) {
          console.error("Failed to fetch product", error);
          router.push("/dashboard");
      } finally {
          setLoading(false);
      }
  }

  async function onSubmit(values: EditProductValues) {
    try {
      const payload = {
          ...values,
          images: values.imageUrl ? [values.imageUrl] : [],
      }
      await api.patch(`/products/${id}`, payload)
      toast.success("Product updated successfully")
      router.push("/dashboard")
    } catch (error) {
      console.error(error)
      toast.error("Failed to update product");
    }
  }

  if (loading) {
      return <div>Loading...</div>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Breadcrumbs />
      <Card>
        <CardHeader>
          <CardTitle>Edit Product</CardTitle>
          <CardDescription>Update your item details.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Item Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="Electronics, Clothing..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>

              <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NEW">New</SelectItem>
                        <SelectItem value="LIKE_NEW">Like New</SelectItem>
                        <SelectItem value="GOOD">Good</SelectItem>
                        <SelectItem value="FAIR">Fair</SelectItem>
                        <SelectItem value="POOR">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="DRAFT">Draft (Hidden)</SelectItem>
                        <SelectItem value="SOLD">Sold</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your item..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">Update Product</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

