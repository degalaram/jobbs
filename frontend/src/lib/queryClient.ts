import { QueryClient, QueryFunction } from "@tanstack/react-query";

// API Base URL configuration
const getApiBaseUrl = () => {
  // In development, use relative URLs (same server)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // If deployed on separate platforms, point to backend
    if (hostname.includes('vercel.app') || hostname.includes('netlify.app') || hostname.includes('surge.sh')) {
      // Your actual Railway backend URL
      return 'https://jobportalbackend-production-8562.up.railway.app';
    }
  }
  
  // For local development and same-server deployments
  return '';
};

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const fullUrl = getApiBaseUrl() + url;
  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = getApiBaseUrl() + queryKey.join("/");
    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
