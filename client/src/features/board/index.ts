// =============================================================================
// Board feature — public surface
// =============================================================================

export { default as BoardListPage } from "./pages/BoardListPage";
export { default as BoardDetailPage } from "./pages/BoardDetailPage";
export type {
  BoardError,
  CreatePostInput,
  Post,
  PostAuthorSummary,
  PostListParams,
  PostListResult,
  PostWithAuthor,
  UpdatePostInput,
} from "./types";
export {
  useCreatePost,
  useDeletePost,
  usePost,
  usePostList,
  useUpdatePost,
} from "./hooks/usePosts";
