import { redirect } from "next/navigation";
import { fetchServer } from "../../lib/api-server";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  try {
    const profile = await fetchServer<{ userId: string }>('/auth/profile');
    
    if (!profile || !profile.userId) {
      redirect("/");
    }

    const [products, transactions] = await Promise.all([
      fetchServer<any[]>(`/products/user/${profile.userId}`, { 
        params: { includeOffers: 'true' } 
      }),
      fetchServer<any[]>('/transactions/my')
    ]);

    return (
      <DashboardClient 
        initialProducts={products} 
        initialTransactions={transactions}
        userId={profile.userId}
      />
    );
  } catch (error) {
    console.error("Dashboard SSR Error:", error);
    redirect("/");
  }
}
