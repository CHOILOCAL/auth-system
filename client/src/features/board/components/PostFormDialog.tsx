// =============================================================================
// PostFormDialog — create / edit modal
// =============================================================================
// Single component handles both create and edit. The parent passes either
// an `initial` post (edit mode) or nothing (create mode).
//
// Validation runs through zodResolver so the user sees inline errors before
// submission. Server-side errors (RLS, network) are surfaced as a banner
// returned via the mutation's onError.
// =============================================================================

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  POST_CONTENT_MAX,
  POST_TITLE_MAX,
  postFormSchema,
  type PostFormValues,
} from "../schemas";
import { useCreatePost, useUpdatePost } from "../hooks/usePosts";
import type { PostWithAuthor } from "../types";
import styles from "../styles/board.module.scss";

interface PostFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Pick<PostWithAuthor, "id" | "title" | "content"> | null;
  onSuccess?: (post: PostWithAuthor) => void;
}

const PostFormDialog: React.FC<PostFormDialogProps> = ({
  open,
  onOpenChange,
  initial,
  onSuccess,
}) => {
  const isEdit = Boolean(initial?.id);
  const createMutation = useCreatePost();
  const updateMutation = useUpdatePost();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: { title: "", content: "" },
  });

  // Reset form whenever dialog re-opens for a new target.
  useEffect(() => {
    if (open) {
      reset({
        title: initial?.title ?? "",
        content: initial?.content ?? "",
      });
    }
  }, [open, initial?.id, initial?.title, initial?.content, reset]);

  const titleValue = watch("title") ?? "";
  const contentValue = watch("content") ?? "";

  const onSubmit = async (values: PostFormValues) => {
    try {
      if (isEdit && initial) {
        const post = await updateMutation.mutateAsync({
          id: initial.id,
          ...values,
        });
        toast.success("게시글이 수정되었습니다.");
        onSuccess?.(post);
      } else {
        const post = await createMutation.mutateAsync(values);
        toast.success("게시글이 작성되었습니다.");
        onSuccess?.(post);
      }
      onOpenChange(false);
    } catch (err) {
      const message =
        (err as { message?: string } | null)?.message ?? "오류가 발생했습니다.";
      toast.error(message);
    }
  };

  const busy =
    isSubmitting || createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "게시글 수정" : "새 게시글 작성"}</DialogTitle>
          <DialogDescription>
            제목과 내용을 입력해주세요. 작성한 글은 본인만 수정·삭제할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={styles.formField}>
            <label className={styles.formLabel} htmlFor="post-title">
              제목
            </label>
            <input
              id="post-title"
              className={styles.formInput}
              placeholder="제목을 입력하세요"
              maxLength={POST_TITLE_MAX}
              autoComplete="off"
              aria-invalid={Boolean(errors.title)}
              disabled={busy}
              {...register("title")}
            />
            <div className={styles.formCounter}>
              {titleValue.length} / {POST_TITLE_MAX}
            </div>
            {errors.title && (
              <p className={styles.formError}>{errors.title.message}</p>
            )}
          </div>

          <div className={styles.formField}>
            <label className={styles.formLabel} htmlFor="post-content">
              내용
            </label>
            <textarea
              id="post-content"
              className={styles.formTextarea}
              placeholder="내용을 입력하세요"
              maxLength={POST_CONTENT_MAX}
              aria-invalid={Boolean(errors.content)}
              disabled={busy}
              {...register("content")}
            />
            <div className={styles.formCounter}>
              {contentValue.length} / {POST_CONTENT_MAX}
            </div>
            {errors.content && (
              <p className={styles.formError}>{errors.content.message}</p>
            )}
          </div>

          <DialogFooter className={styles.formActions}>
            <button
              type="button"
              className={styles.ghostButton}
              onClick={() => onOpenChange(false)}
              disabled={busy}
            >
              취소
            </button>
            <button type="submit" className={styles.primaryButton} disabled={busy}>
              {busy && <span className={styles.spinner} aria-hidden />}
              {isEdit ? "수정 저장" : "작성하기"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PostFormDialog;
