import { QueryClient } from '@tanstack/react-query';
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest({
  url,
  method = 'GET',
  body = undefined,
}: {
  url: string;
  method?: string;
  body?: unknown;
}): Promise<any> {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  await throwIfResNotOk(res);
  try {
    return await (res as any).json();
  } catch (e) {
    return res;
  }
}

type UnauthorizedBehavior = 'returnNull' | 'throw';
// ✅ FIXED: Simplified function signature to avoid complex type issues
export const getQueryFn = <T>(options: { on401: UnauthorizedBehavior }) => {
  return async ({ queryKey }: any): Promise<T> => {
    const { on401: unauthorizedBehavior } = options;
    const res = await fetch(queryKey[0] as string, {
      credentials: 'include',
    });

    if (unauthorizedBehavior === 'returnNull' && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await (res as any).json();
  };
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: 'throw' }),
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
