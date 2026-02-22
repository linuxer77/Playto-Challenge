import { cva } from "class-variance-authority";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";
import { likesApi } from "../api";
import { CommentThread } from "./CommentThread";

const cardClass = cva(
  "mx-2 my-2 border border-[var(--tokyo-muted)] bg-[var(--tokyo-surface)] px-4 py-3 transition-colors hover:border-[var(--tokyo-prompt)]",
);
const actionButtonClass = cva(
  "terminal-btn terminal-action inline-flex items-center gap-2 border border-[var(--tokyo-muted)] px-2.5 py-1.5 text-xs font-medium text-[var(--tokyo-prompt)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--tokyo-prompt)]",
);

export function PostCard({ post, expanded = false }) {
  const [isPostLikedByViewer, setIsPostLikedByViewer] = useState(
    Boolean(post.is_liked_by_viewer),
  );
  const [viewerPostLikeId, setViewerPostLikeId] = useState(
    post.viewer_post_like_id || null,
  );
  const [postLikeCount, setPostLikeCount] = useState(post.post_like_count || 0);
  const [threadLikeCount, setThreadLikeCount] = useState(
    post.thread_like_count || 0,
  );
  const [likeError, setLikeError] = useState("");
  const [likeLoading, setLikeLoading] = useState(false);
  const navigate = useNavigate();
  const totalLikeCount = useMemo(
    () => postLikeCount + threadLikeCount,
    [postLikeCount, threadLikeCount],
  );

  const togglePostLike = async () => {
    setLikeError("");
    setLikeLoading(true);
    try {
      if (isPostLikedByViewer && viewerPostLikeId) {
        await likesApi.deletePostLike(viewerPostLikeId);
        setIsPostLikedByViewer(false);
        setViewerPostLikeId(null);
        setPostLikeCount((currentLikeCount) =>
          Math.max(0, currentLikeCount - 1),
        );
      } else {
        const payload = await likesApi.createPostLike(post.id);
        setIsPostLikedByViewer(true);
        setViewerPostLikeId(payload.id);
        setPostLikeCount((currentLikeCount) => currentLikeCount + 1);
      }
    } catch (err) {
      setLikeError(err.message || "Unable to update like.");
    } finally {
      setLikeLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!expanded) {
        navigate(`/posts/${post.id}`);
      }
    }
  };

  const openPostDetail = () => {
    if (!expanded) {
      navigate(`/posts/${post.id}`);
    }
  };

  return (
    <article
      className={cardClass()}
      role="button"
      tabIndex={0}
      onClick={openPostDetail}
      onKeyDown={handleKeyDown}
      aria-expanded={expanded}
    >
      <div className="min-w-0 flex-1">
        <header className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs leading-5 text-[var(--tokyo-muted)]">
          <span>
            <span className="text-[var(--tokyo-muted)]">+-- </span>
            <span className="terminal-token-meta">post/</span>
            <span className="terminal-token-number">{post.id}</span>
          </span>
          <span>|</span>
          <span>
            <span className="text-[var(--tokyo-muted)]">@</span>
            <span className="terminal-token-key">
              {post.author_username || `user-${post.author}`}
            </span>
          </span>
          <span>|</span>
          <span>{new Date(post.date).toLocaleString()}</span>
        </header>

        <p className="mt-2 text-base font-semibold text-[var(--tokyo-text)]">
          {post.title}
        </p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--tokyo-text)]">
          {post.content}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={cn(
              actionButtonClass(),
              "border-[var(--tokyo-muted)] text-[var(--tokyo-text)]",
            )}
            onClick={(event) => {
              event.stopPropagation();
              if (!expanded) {
                navigate(`/posts/${post.id}`);
              }
            }}
          >
            <span className="terminal-token-command">&gt;</span>{" "}
            <span className="terminal-token-flag">thread</span>
            <span className="text-[var(--tokyo-muted)]">:</span>
            <span className="terminal-token-meta">
              {expanded ? "open" : "view"}
            </span>
          </button>

          <button
            type="button"
            className={cn(
              actionButtonClass(),
              isPostLikedByViewer
                ? "border-[var(--tokyo-alert)] bg-[var(--tokyo-surface)] text-[var(--tokyo-alert)]"
                : "border-[var(--tokyo-muted)] text-[var(--tokyo-text)]",
            )}
            onClick={(event) => {
              event.stopPropagation();
              togglePostLike();
            }}
            aria-pressed={isPostLikedByViewer}
            disabled={likeLoading}
          >
            <span>
              {isPostLikedByViewer
                ? `[*LIKE: ${postLikeCount}]`
                : `[LIKE: ${postLikeCount}]`}
            </span>
          </button>
        </div>

        {likeError && (
          <p className="mt-2 text-xs text-[var(--tokyo-alert)]">
            error: {likeError}
          </p>
        )}

        <section
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
            expanded
              ? "mt-3 grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0",
          )}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <div className="overflow-hidden">
            <CommentThread
              postId={post.id}
              onThreadLikeDelta={(threadLikeDelta) => {
                setThreadLikeCount((currentLikeCount) =>
                  Math.max(0, currentLikeCount + threadLikeDelta),
                );
              }}
            />
          </div>
        </section>
      </div>
    </article>
  );
}
