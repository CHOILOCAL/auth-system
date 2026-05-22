// =============================================================================
// Board feature — query + mutation hooks
// =============================================================================
// Provides:
//   - usePostList(params)        : paginated list with caching
//   - usePost(id)                : single post detail
//   - useCreatePost()            : optimistic insert at top of cached pages
//   - useUpdatePost()            : optimistic patch of detail + list caches
//   - useDeletePost()            : optimistic remove with rollback on error
//
// All mutations follow the same pattern:
//   1. cancelQueries → snapshot affected caches
//   2. optimistically mutate caches
//   3. on error → restore snapshots
//   4. on success → reconcile with server response
//   5. on settled → invalidate the related query family
// =============================================================================

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "@/lib/queryClient";
import {
  createPost,
  deletePost,
  getPostById,
  listPosts,
  updatePost,
} from "../api/posts";
import type {
  BoardError,
  CreatePostInput,
  PostListParams,
  PostListResult,
  PostWithAuthor,
  UpdatePostInput,
} from "../types";

// ---- Pagination defaults ---------------------------------------------------

export const DEFAULT_PAGE_SIZE = 10;

// ---- Queries ----------------------------------------------------------------

export const usePostList = (
  params: PostListParams = { page: 0, pageSize: DEFAULT_PAGE_SIZE },
  options?: Omit<
    UseQueryOptions<PostListResult, BoardError>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery<PostListResult, BoardError>({
    queryKey: queryKeys.posts.list(params),
    queryFn: () => listPosts(params),
    placeholderData: (prev) => prev,
    ...options,
  });

export const usePost = (
  id: string | undefined,
  options?: Omit<
    UseQueryOptions<PostWithAuthor, BoardError>,
    "queryKey" | "queryFn" | "enabled"
  >,
) =>
  useQuery<PostWithAuthor, BoardError>({
    queryKey: queryKeys.posts.detail(id ?? "__missing__"),
    queryFn: () => getPostById(id as string),
    enabled: Boolean(id),
    ...options,
  });

// ---- Mutations -------------------------------------------------------------

interface ListSnapshot {
  queryKey: readonly unknown[];
  data: PostListResult | undefined;
}

const snapshotAllLists = (
  queryClient: ReturnType<typeof useQueryClient>,
): ListSnapshot[] => {
  const cache = queryClient.getQueryCache();
  return cache
    .findAll({ queryKey: queryKeys.posts.lists() })
    .map((q) => ({
      queryKey: q.queryKey,
      data: queryClient.getQueryData<PostListResult>(q.queryKey),
    }));
};

const restoreSnapshots = (
  queryClient: ReturnType<typeof useQueryClient>,
  snapshots: ListSnapshot[],
) => {
  for (const snap of snapshots) {
    queryClient.setQueryData(snap.queryKey, snap.data);
  }
};

// ----- Create ---------------------------------------------------------------

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  return useMutation<
    PostWithAuthor,
    BoardError,
    CreatePostInput,
    { snapshots: ListSnapshot[]; tempId: string }
  >({
    mutationFn: (input) => {
      if (!user?.id) {
        return Promise.reject<PostWithAuthor>({
          code: "NOT_AUTHENTICATED",
          message: "로그인이 필요합니다.",
        } satisfies BoardError);
      }
      return createPost(input, user.id);
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.lists() });
      const snapshots = snapshotAllLists(queryClient);
      const tempId = `optimistic-${crypto.randomUUID()}`;
      const now = new Date().toISOString();

      const optimisticPost: PostWithAuthor = {
        id: tempId,
        author_id: user?.id ?? "",
        title: input.title.trim(),
        content: input.content.trim(),
        created_at: now,
        updated_at: now,
        author: {
          id: user?.id ?? "",
          nickname: profile?.nickname ?? "나",
          avatar_url: profile?.avatar_url ?? null,
        },
      };

      // Insert at top of every cached first page (page 0).
      for (const snap of snapshots) {
        if (!snap.data) continue;
        const isFirstPage = snap.data.page === 0;
        if (!isFirstPage) continue;
        queryClient.setQueryData<PostListResult>(snap.queryKey, {
          ...snap.data,
          items: [optimisticPost, ...snap.data.items].slice(0, snap.data.pageSize),
          total: snap.data.total + 1,
        });
      }

      return { snapshots, tempId };
    },
    onError: (_err, _input, context) => {
      if (context) restoreSnapshots(queryClient, context.snapshots);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
    },
  });
};

// ----- Update ---------------------------------------------------------------

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation<
    PostWithAuthor,
    BoardError,
    UpdatePostInput,
    {
      snapshots: ListSnapshot[];
      detailKey: readonly unknown[];
      detailSnapshot: PostWithAuthor | undefined;
    }
  >({
    mutationFn: (input) => updatePost(input),
    onMutate: async (input) => {
      const detailKey = queryKeys.posts.detail(input.id);
      await Promise.all([
        queryClient.cancelQueries({ queryKey: queryKeys.posts.lists() }),
        queryClient.cancelQueries({ queryKey: detailKey }),
      ]);

      const snapshots = snapshotAllLists(queryClient);
      const detailSnapshot = queryClient.getQueryData<PostWithAuthor>(detailKey);

      // Patch lists.
      for (const snap of snapshots) {
        if (!snap.data) continue;
        const idx = snap.data.items.findIndex((p) => p.id === input.id);
        if (idx === -1) continue;
        const next = [...snap.data.items];
        next[idx] = {
          ...next[idx],
          title: input.title.trim(),
          content: input.content.trim(),
          updated_at: new Date().toISOString(),
        };
        queryClient.setQueryData<PostListResult>(snap.queryKey, {
          ...snap.data,
          items: next,
        });
      }

      // Patch detail.
      if (detailSnapshot) {
        queryClient.setQueryData<PostWithAuthor>(detailKey, {
          ...detailSnapshot,
          title: input.title.trim(),
          content: input.content.trim(),
          updated_at: new Date().toISOString(),
        });
      }

      return { snapshots, detailKey, detailSnapshot };
    },
    onError: (_err, _input, context) => {
      if (!context) return;
      restoreSnapshots(queryClient, context.snapshots);
      queryClient.setQueryData(context.detailKey, context.detailSnapshot);
    },
    onSettled: (_data, _err, input) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.detail(input.id),
      });
    },
  });
};

// ----- Delete ---------------------------------------------------------------

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    BoardError,
    string,
    {
      snapshots: ListSnapshot[];
      detailKey: readonly unknown[];
      detailSnapshot: PostWithAuthor | undefined;
    }
  >({
    mutationFn: (id) => deletePost(id),
    onMutate: async (id) => {
      const detailKey = queryKeys.posts.detail(id);
      await Promise.all([
        queryClient.cancelQueries({ queryKey: queryKeys.posts.lists() }),
        queryClient.cancelQueries({ queryKey: detailKey }),
      ]);

      const snapshots = snapshotAllLists(queryClient);
      const detailSnapshot = queryClient.getQueryData<PostWithAuthor>(detailKey);

      for (const snap of snapshots) {
        if (!snap.data) continue;
        const filtered = snap.data.items.filter((p) => p.id !== id);
        if (filtered.length === snap.data.items.length) continue;
        queryClient.setQueryData<PostListResult>(snap.queryKey, {
          ...snap.data,
          items: filtered,
          total: Math.max(0, snap.data.total - 1),
        });
      }

      queryClient.removeQueries({ queryKey: detailKey });

      return { snapshots, detailKey, detailSnapshot };
    },
    onError: (_err, _id, context) => {
      if (!context) return;
      restoreSnapshots(queryClient, context.snapshots);
      if (context.detailSnapshot) {
        queryClient.setQueryData(context.detailKey, context.detailSnapshot);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
    },
  });
};
