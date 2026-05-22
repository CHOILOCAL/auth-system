// =============================================================================
// BoardDetailPage — single post view + author-only edit/delete
// =============================================================================

import { useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/lib/routes";
import { usePost } from "../hooks/usePosts";
import PostFormDialog from "../components/PostFormDialog";
import DeletePostDialog from "../components/DeletePostDialog";
import styles from "../styles/board.module.scss";

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const BoardDetailPage: React.FC = () => {
  const [, params] = useRoute(ROUTES.BOARD_DETAIL);
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const id = params?.id;

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: post, isLoading, isError, error } = usePost(id);
  const isAuthor = Boolean(user && post && user.id === post.author_id);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <section className={styles.shell}>
          <div className={styles.detailContainer}>
            <Link href={ROUTES.BOARD} className={styles.backLink}>
              <ArrowLeft className="h-3.5 w-3.5" /> 게시판으로
            </Link>

            {isLoading && (
              <div className={styles.stateBlock}>
                <p>불러오는 중...</p>
              </div>
            )}

            {isError && (
              <div className={styles.stateBlock} role="alert">
                <h3>게시글을 불러오지 못했습니다</h3>
                <p>{error?.message ?? "잠시 후 다시 시도해주세요."}</p>
              </div>
            )}

            {!isLoading && !isError && post && (
              <>
                <p className={styles.eyebrow}>Post</p>
                <h1 className={styles.detailTitle}>{post.title}</h1>

                <div className={styles.detailMeta}>
                  <span className={styles.detailAuthorAvatar} aria-hidden>
                    {post.author.nickname.charAt(0)}
                  </span>
                  <span style={{ fontWeight: 600 }}>
                    {post.author.nickname}
                  </span>
                  <span aria-hidden>·</span>
                  <span>{formatDateTime(post.created_at)}</span>
                  {post.updated_at !== post.created_at && (
                    <>
                      <span aria-hidden>·</span>
                      <span>{formatDateTime(post.updated_at)} 수정됨</span>
                    </>
                  )}
                </div>

                <article className={styles.detailContent}>{post.content}</article>

                <div className={styles.detailActions}>
                  <Link href={ROUTES.BOARD} className={styles.ghostButton}>
                    <ArrowLeft className="h-3.5 w-3.5" /> 목록
                  </Link>
                  {isAuthor && (
                    <>
                      <button
                        type="button"
                        className={styles.ghostButton}
                        onClick={() => setEditOpen(true)}
                      >
                        <Pencil className="h-3.5 w-3.5" /> 수정
                      </button>
                      <button
                        type="button"
                        className={styles.dangerButton}
                        onClick={() => setDeleteOpen(true)}
                      >
                        <Trash2 className="h-3.5 w-3.5" /> 삭제
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </section>

        {post && (
          <>
            <PostFormDialog
              open={editOpen}
              onOpenChange={setEditOpen}
              initial={{
                id: post.id,
                title: post.title,
                content: post.content,
              }}
            />
            <DeletePostDialog
              open={deleteOpen}
              onOpenChange={setDeleteOpen}
              postId={post.id}
              onDeleted={() => navigate(ROUTES.BOARD)}
            />
          </>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default BoardDetailPage;
