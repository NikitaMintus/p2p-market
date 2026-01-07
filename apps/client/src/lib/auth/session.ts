import { cookies } from 'next/headers';
import { fetchServer } from '../api-server';

export async function getSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value;
}

export async function getServerUser() {
  try {
    // fetchServer automatically handles:
    // 1. Reading the token from cookies
    // 2. Setting Authorization header
    // 3. Using the correct API_URL (internal docker vs public)
    const user = await fetchServer<any>('/auth/profile', {
      cache: 'no-store'
    });
    return user;
  } catch (error: any) {
    // Suppress errors for "not logged in" state to avoid log noise
    if (error?.status === 401) {
        return null;
    }
    // console.error('Error fetching server user:', error);
    return null;
  }
}

