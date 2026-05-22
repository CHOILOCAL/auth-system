// =============================================================================
// Board feature — Supabase service layer
// =============================================================================
// Pure async functions. No React, no hooks, no toasts. Errors are normalized
// to BoardError so the hook layer can render consistent UX without sniffing
// Postgres error codes everywhere.
//
// All write paths still rely on RLS for authoritative enforcement; the client
// checks here are purely UX (avoid an obvious bad request).
// =============================================================================

import { supabase } from "@/lib/supabase/client";
import type {
  BoardError,
  CreatePostInput,
  PostAuthorSummary,
  PostListParams,
  PostListResult,
  PostWithAuthor,
  UpdatePostInput,
} from "../types";

// ---- Error normalization ----------------------------------------------------

const normalizeError = (error: unknown, fallback: BoardError): BoardError => {
  if (!error) return fallback;
  const msg = (error as { message?: string }).message ?? "";
  const code = (error as { code?: string }).code ?? "";
  const status = (error as { status?: number; statusCode?: number }).status
    ?? (error as { statusCode?: number }).statusCode;

  if (code === "PGRST116" || status === 404) {
    return { code: "NOT_FOUND", message: "요청한 게시글을 찾을 수 없습니다." };
  }
  // Postgres RLS violation surfaces as 42501 / "new row violates row-level security policy"
  if (code === "42501" || /row-level security/i.test(msg)) {
    return { code: "NOT_AUTHORIZED", message: "권한이 없습니다." };
  }
  if (status === 401) {
    return { code: "NOT_AUTHENTICATED", message: "로그인이 필요합니다." };
  }
  if (/network|fetch/i.test(msg)) {
    return { code: "NETWORK_ERROR", message: "네트워크 연결을 확인해주세요." };
  }
  return { ...fallback, details: msg };
};

// ---- Internal helpers -------------------------------------------------------

const POST_SELECT = `
  id,
  author_id,
  title,
  content,
  created_at,
  updated_at,
  author:profiles!posts_author_id_fkey (
    id,
    nickname,
    avatar_url
  )
` as const;

interface RawPostRow {
  id: string;
  author_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  author: PostAuthorSummary | PostAuthorSummary[] | null;
}

const flattenAuthor = (row: RawPostRow): PostWithAuthor => {
  const author = Array.isArray(row.author) ? row.author[0] ?? null : row.author;
  return {
    id: row.id,
    author_id: row.author_id,
    title: row.title,
    content: row.content,
    created_at: row.created_at,
    updated_at: row.updated_at,
    author: author ?? {
      id: row.author_id,
      nickname: "(알 수 없음)",
      avatar_url: null,
    },
  };
};

// ---- Queries ---------------------------------------------------------------

export const listPosts = async ({
  page,
  pageSize,
}: PostListParams): Promise<PostListResult> => {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("posts")
    .select(POST_SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw normalizeError(error, {
      code: "UNKNOWN_ERROR",
      message: "게시글 목록을 불러오지 못했습니다.",
    });
  }

  const items = (data ?? []).map((row) => flattenAuthor(row as RawPostRow));
  const total = count ?? 0;
  return {
    items,
    total,
    page,
    pageSize,
    hasNextPage: from + items.length < total,
  };
};

export const getPostById = async (id: string): Promise<PostWithAuthor> => {
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("id", id)
    .single();

  if (error || !data) {
    throw normalizeError(error, {
      code: "NOT_FOUND",
      message: "게시글을 찾을 수 없습니다.",
    });
  }
  return flattenAuthor(data as RawPostRow);
};

// ---- Mutations -------------------------------------------------------------

export const createPost = async (
  input: CreatePostInput,
  authorId: string,
): Promise<PostWithAuthor> => {
  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: authorId,
      title: input.title.trim(),
      content: input.content.trim(),
    })
    .select(POST_SELECT)
    .single();

  if (error || !data) {
    throw normalizeError(error, {
      code: "UNKNOWN_ERROR",
      message: "게시글을 작성하지 못했습니다.",
    });
  }
  return flattenAuthor(data as RawPostRow);
};

export const updatePost = async (
  input: UpdatePostInput,
): Promise<PostWithAuthor> => {
  const { data, error } = await supabase
    .from("posts")
    .update({
      title: input.title.trim(),
      content: input.content.trim(),
    })
    .eq("id", input.id)
    .select(POST_SELECT)
    .single();

  if (error || !data) {
    throw normalizeError(error, {
      code: "UNKNOWN_ERROR",
      message: "게시글을 수정하지 못했습니다.",
    });
  }
  return flattenAuthor(data as RawPostRow);
};

export const deletePost = async (id: string): Promise<void> => {
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) {
    throw normalizeError(error, {
      code: "UNKNOWN_ERROR",
      message: "게시글을 삭제하지 못했습니다.",
    });
  }
};
