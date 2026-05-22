// =============================================================================
// TanStack Query client
// =============================================================================
// Singleton QueryClient with conservative defaults tuned for an authenticated
// CRUD app:
//   - 60s staleTime so navigating between pages doesn't refetch on every focus
//   - retries disabled for mutations (we surface errors to the user)
//   - retry once on queries with backoff
// =============================================================================

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Bail on auth/permission errors — retrying won't help.
        const status = (error as { status?: number; statusCode?: number } | null)?.status
          ?? (error as { statusCode?: number } | null)?.statusCode;
        if (status === 401 || status === 403 || status === 404) return false;
        return failureCount < 1;
      },
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
    },
    mutations: {
      retry: false,
    },
  },
});

// =============================================================================
// Centralized query keys
// =============================================================================
// Use a tuple-style hierarchy so we can invalidate broadly (`["posts"]`) or
// narrowly (`["posts", "detail", id]`) without typo risk.
// =============================================================================

export const queryKeys = {
  posts: {
    all: ["posts"] as const,
    lists: () => [...queryKeys.posts.all, "list"] as const,
    list: (params: { page: number; pageSize: number }) =>
      [...queryKeys.posts.lists(), params] as const,
    details: () => [...queryKeys.posts.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.posts.details(), id] as const,
  },
  profile: {
    all: ["profile"] as const,
    detail: (userId: string) => [...queryKeys.profile.all, userId] as const,
  },
} as const;
