// =============================================================================
// DeletePostDialog — destructive action confirmation
// =============================================================================
// Wraps the shadcn AlertDialog with an opinionated copy/wiring for board
// posts. The mutation is owned here so the dialog can disable itself while
// the request is in flight.
// =============================================================================

import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeletePost } from "../hooks/usePosts";

interface DeletePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  onDeleted?: () => void;
}

const DeletePostDialog: React.FC<DeletePostDialogProps> = ({
  open,
  onOpenChange,
  postId,
  onDeleted,
}) => {
  const deleteMutation = useDeletePost();

  const handleConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(postId);
      toast.success("게시글이 삭제되었습니다.");
      onDeleted?.();
      onOpenChange(false);
    } catch (err) {
      const message =
        (err as { message?: string } | null)?.message ?? "삭제에 실패했습니다.";
      toast.error(message);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>이 게시글을 삭제하시겠어요?</AlertDialogTitle>
          <AlertDialogDescription>
            이 작업은 되돌릴 수 없습니다. 게시글이 영구적으로 삭제됩니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            취소
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={deleteMutation.isPending}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {deleteMutation.isPending ? "삭제 중..." : "삭제"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeletePostDialog;
