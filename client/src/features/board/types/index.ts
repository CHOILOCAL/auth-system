// =============================================================================
// Board feature — domain types
// =============================================================================
// Distinguish between the raw `PostRow` from Supabase and the enriched
// `PostWithAuthor` we surface to UI: the latter carries the nickname/avatar
// joined from `profiles` so list/detail views never need a second round-trip.
// =============================================================================

import type { PostRow } from "@/lib/supabase/database.types";

export type Post = PostRow;

export interface PostAuthorSummary {
  id: string;
  nickname: string;
  avatar_url: string | null;
}

export interface PostWithAuthor extends Post {
  author: PostAuthorSummary;
}

export interface PostListResult {
  items: PostWithAuthor[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
}

export interface PostListParams {
  page: number;
  pageSize: number;
}

export interface CreatePostInput {
  title: string;
  content: string;
}

export interface UpdatePostInput {
  id: string;
  title: string;
  content: string;
}

// =============================================================================
// Normalized error contract for the board API surface.
// =============================================================================
export type BoardErrorCode =
  | "NOT_AUTHENTICATED"
  | "NOT_AUTHORIZED"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "NETWORK_ERROR"
  | "UNKNOWN_ERROR";

export interface BoardError {
  code: BoardErrorCode;
  message: string;
  details?: string;
}
