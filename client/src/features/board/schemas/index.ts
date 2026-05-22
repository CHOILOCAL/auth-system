// =============================================================================
// Board feature — zod schemas
// =============================================================================
// Mirror the SQL CHECK constraints in posts.schema.sql so we surface form
// errors before round-tripping to Supabase. Keep magic numbers in sync there.
// =============================================================================

import { z } from "zod";

export const POST_TITLE_MIN = 1;
export const POST_TITLE_MAX = 120;
export const POST_CONTENT_MIN = 1;
export const POST_CONTENT_MAX = 10_000;

export const postFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(POST_TITLE_MIN, "제목을 입력해주세요.")
    .max(POST_TITLE_MAX, `제목은 ${POST_TITLE_MAX}자 이하여야 합니다.`),
  content: z
    .string()
    .trim()
    .min(POST_CONTENT_MIN, "내용을 입력해주세요.")
    .max(POST_CONTENT_MAX, `내용은 ${POST_CONTENT_MAX}자 이하여야 합니다.`),
});

export type PostFormValues = z.infer<typeof postFormSchema>;
