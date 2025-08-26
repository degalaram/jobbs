import { QueryClient, QueryFunction } from "@tanstack/react-query";

// API Base URL configuration
const getApiBaseUrl = () => {
  // In development, use relative URLs (same server)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // If deployed on separate platforms, point to backend
    if (hostname.includes('vercel.app') || hostname.includes('netlify.app') || hostname.includes('surge.sh')) {
      // Your actual Railway backend URL (Public URL)
      return 'https://airy-expression-production.up.railway.app';
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

    if (res.status === 401) {
      if (unauthorizedBehavior === "returnNull") {
        return null;
      }
      throw new Error("Unauthorized");
    }

    await throwIfResNotOk(res);
    return res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      staleTime: 1000 * 60 * 10, // 10 minutes
      retry: (failureCount, error) => {
        if (error.message === "Unauthorized") return false;
        return failureCount < 3;
      },
    },
  },
});
