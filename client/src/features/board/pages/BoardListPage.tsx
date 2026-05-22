// =============================================================================
// BoardListPage — paginated, optimistic-friendly board feed
// =============================================================================

import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Plus } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ROUTES } from "@/lib/routes";
import { DEFAULT_PAGE_SIZE, usePostList } from "../hooks/usePosts";
import PostFormDialog from "../components/PostFormDialog";
import styles from "../styles/board.module.scss";

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const isOptimisticId = (id: string) => id.startsWith("optimistic-");

const BoardListPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading, isError, error, refetch, isFetching } = usePostList({
    page,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  const totalPages = useMemo(() => {
    if (!data) return 0;
    return Math.max(1, Math.ceil(data.total / data.pageSize));
  }, [data]);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <section className={styles.shell}>
          <div className={styles.container}>
            <header className={styles.pageHeader}>
              <div>
                <p className={styles.eyebrow}>Community Board</p>
                <h1 className={styles.pageTitle}>게시판</h1>
                <p className={styles.pageSubtitle}>
                  팀원들과 의견과 정보를 공유하는 공간입니다. 본인이 작성한
                  글만 수정·삭제할 수 있어요.
                </p>
              </div>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => setCreateOpen(true)}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4" />
                새 글 작성
              </button>
            </header>

            <div className={styles.toolbar}>
              <span className={styles.totalCount}>
                Total <strong>{data?.total ?? 0}</strong> posts
              </span>
              {isFetching && !isLoading && (
                <span className={styles.totalCount}>업데이트 중…</span>
              )}
            </div>

            {isLoading && (
              <ul className={styles.postList} aria-busy="true">
                {Array.from({ length: 6 }).map((_, i) => (
                  <li key={i} className={styles.skeletonRow}>
                    <div>
                      <div
                        className={styles.skeletonLine}
                        style={{ width: "60%" }}
                      />
                      <div
                        className={styles.skeletonLine}
                        style={{ width: "40%", marginTop: 8 }}
                      />
                    </div>
                    <div
                      className={styles.skeletonLine}
                      style={{ width: 80 }}
                    />
                  </li>
                ))}
              </ul>
            )}

            {isError && (
              <div className={styles.stateBlock} role="alert">
                <h3>게시글을 불러오지 못했습니다</h3>
                <p>{error?.message ?? "잠시 후 다시 시도해주세요."}</p>
                <button
                  type="button"
                  className={styles.ghostButton}
                  onClick={() => refetch()}
                >
                  다시 시도
                </button>
              </div>
            )}

            {!isLoading && !isError && data && data.items.length === 0 && (
              <div className={styles.stateBlock}>
                <h3>아직 게시글이 없어요</h3>
                <p>첫 번째 게시글을 작성해보세요.</p>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={() => setCreateOpen(true)}
                >
                  <Plus className="h-4 w-4" />첫 글 작성하기
                </button>
              </div>
            )}

            {!isLoading && !isError && data && data.items.length > 0 && (
              <ul className={styles.postList}>
                {data.items.map((post, idx) => {
                  const optimistic = isOptimisticId(post.id);
                  const indexNumber =
                    data.total - (page * data.pageSize + idx);
                  return (
                    <li key={post.id} className={styles.postRow}>
                      <Link
                        href={ROUTES.BOARD_DETAIL.replace(":id", post.id)}
                        className={styles.postRowLink}
                        // Disable navigation for optimistic placeholders
                        onClick={(e) => {
                          if (optimistic) e.preventDefault();
                        }}
                      >
                        <div className={styles.postBody}>
                          <h2 className={styles.postTitle}>
                            <span className={styles.postIndex}>
                              No. {String(indexNumber).padStart(3, "0")}
                            </span>
                            {post.title}
                            {optimistic && (
                              <span
                                className={styles.optimisticBadge}
                                style={{ marginLeft: 8 }}
                              >
                                Saving…
                              </span>
                            )}
                          </h2>
                          <p className={styles.postExcerpt}>{post.content}</p>
                        </div>
                        <div className={styles.postMeta}>
                          <span>{post.author.nickname}</span>
                          <span className={styles.postMetaDot} />
                          <span>{formatDate(post.created_at)}</span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}

            {data && totalPages > 1 && (
              <nav className={styles.pagination} aria-label="페이지네이션">
                <button
                  type="button"
                  className={styles.pageButton}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0 || isFetching}
                >
                  이전
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`${styles.pageButton} ${
                      page === i ? styles.active : ""
                    }`}
                    onClick={() => setPage(i)}
                    disabled={isFetching}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  type="button"
                  className={styles.pageButton}
                  onClick={() =>
                    setPage((p) => (data.hasNextPage ? p + 1 : p))
                  }
                  disabled={!data.hasNextPage || isFetching}
                >
                  다음
                </button>
              </nav>
            )}
          </div>
        </section>

        <PostFormDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onSuccess={() => setPage(0)}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default BoardListPage;
