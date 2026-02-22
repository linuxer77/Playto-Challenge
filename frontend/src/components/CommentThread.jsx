import { cva } from "class-variance-authority";
import { useCallback, useEffect, useState } from "react";
import { cn } from "../lib/utils";
import { commentsApi, likesApi } from "../api";

const nodeClass = cva("relative");
const actionButtonClass = cva(
  "terminal-btn terminal-action inline-flex items-center gap-1.5 border border-[var(--tokyo-muted)] px-2.5 py-1 text-xs font-medium text-[var(--tokyo-prompt)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--tokyo-prompt)]",
);

function CommentNode({
  node,
  depth,
  isLast,
  postId,
  onRefresh,
  onThreadLikeDelta,
}) {
  const [isCommentLikedByViewer, setIsCommentLikedByViewer] = useState(
    Boolean(node.is_liked_by_viewer),
  );
  const [viewerCommentLikeId, setViewerCommentLikeId] = useState(
    node.viewer_comment_like_id || null,
  );
  const [commentLikeCount, setCommentLikeCount] = useState(
    node.comment_like_count || 0,
  );
  const [open, setOpen] = useState(true);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [error, setError] = useState("");
  const [likeLoading, setLikeLoading] = useState(false);
  const hasChildren = node.replies.length > 0;
  const childCount = node.replies.length;

  const submitReply = async () => {
    const value = replyText.trim();
    if (!value) return;
    setError("");

    try {
      await commentsApi.create({
        post: postId,
        parent: node.id,
        content: value,
      });
      setReplyText("");
      setReplyOpen(false);
      setOpen(true);
      await onRefresh();
    } catch (err) {
      setError(err.message || "Unable to add reply.");
    }
  };

  const toggleLike = async () => {
    setError("");
    setLikeLoading(true);
    try {
      if (isCommentLikedByViewer && viewerCommentLikeId) {
        await likesApi.deleteCommentLike(viewerCommentLikeId);
        setIsCommentLikedByViewer(false);
        setViewerCommentLikeId(null);
        setCommentLikeCount((currentLikeCount) =>
          Math.max(0, currentLikeCount - 1),
        );
        onThreadLikeDelta?.(-1);
      } else {
        const payload = await likesApi.createCommentLike(node.id);
        setIsCommentLikedByViewer(true);
        setViewerCommentLikeId(payload.id);
        setCommentLikeCount((currentLikeCount) => currentLikeCount + 1);
        onThreadLikeDelta?.(1);
      }
    } catch (err) {
      setError(err.message || "Unable to update comment like.");
    } finally {
      setLikeLoading(false);
    }
  };

  return (
    <div
      className={cn(
        nodeClass(),
        depth > 0 && "tree-node tree-child",
        depth > 0 && isLast && "tree-last",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="border border-[var(--tokyo-muted)] bg-[var(--tokyo-surface)] px-3 py-2">
          <div className="flex flex-wrap items-center gap-x-2 text-xs leading-5 text-[var(--tokyo-muted)]">
            <span className="text-[var(--tokyo-muted)]">
              {depth === 0 ? "+--" : "|__"}{" "}
              <span className="text-[var(--tokyo-muted)]">@</span>
              <span className="terminal-token-key">{node.author}</span>
            </span>
            <span>|</span>
            <span>{new Date(node.created).toLocaleString()}</span>
          </div>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[var(--tokyo-text)]">
            {node.content}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              className={actionButtonClass()}
              onClick={(event) => {
                event.stopPropagation();
                setReplyOpen((value) => !value);
              }}
            >
              <span className="terminal-token-command">&gt;</span>{" "}
              <span className="terminal-token-flag">reply</span>
            </button>
            <button
              type="button"
              className={cn(
                actionButtonClass(),
                isCommentLikedByViewer
                  ? "border-[var(--tokyo-alert)] bg-[var(--tokyo-surface)] text-[var(--tokyo-alert)]"
                  : "border-[var(--tokyo-muted)] text-[var(--tokyo-text)]",
              )}
              onClick={(event) => {
                event.stopPropagation();
                toggleLike();
              }}
              aria-pressed={isCommentLikedByViewer}
              disabled={likeLoading}
            >
              {isCommentLikedByViewer
                ? `[*LIKE: ${commentLikeCount}]`
                : `[LIKE: ${commentLikeCount}]`}
            </button>
            {hasChildren && (
              <button
                type="button"
                className={actionButtonClass()}
                onClick={(event) => {
                  event.stopPropagation();
                  setOpen((value) => !value);
                }}
              >
                {open ? (
                  <>
                    <span className="terminal-token-command">&gt;</span>{" "}
                    <span className="terminal-token-flag">
                      collapse_replies
                    </span>
                    <span className="terminal-token-meta">()</span>
                  </>
                ) : (
                  <>
                    <span className="terminal-token-command">&gt;</span>{" "}
                    <span className="terminal-token-flag">show_</span>
                    <span className="terminal-token-number">{childCount}</span>
                    <span className="terminal-token-flag">
                      _repl{childCount === 1 ? "y" : "ies"}
                    </span>
                    <span className="terminal-token-meta">()</span>
                  </>
                )}
              </button>
            )}
          </div>

          {replyOpen && (
            <div className="mt-2 border border-[var(--tokyo-muted)] bg-[var(--tokyo-void)] p-2">
              <p className="terminal-prompt mb-1 text-xs text-[var(--tokyo-muted)]">
                <span className="terminal-token-flag">reply_to_comment</span>
                <span className="terminal-token-meta">(</span>
                <span className="terminal-token-number">{node.id}</span>
                <span className="terminal-token-meta">):</span>
              </p>
              <textarea
                value={replyText}
                onChange={(event) => setReplyText(event.target.value)}
                className="terminal-textarea min-h-[66px] w-full resize-none px-2 py-2 text-xs outline-none"
                placeholder="type reply..."
              />
              <div className="mt-2 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  className="terminal-btn terminal-action px-2.5 py-1 text-[11px] text-[var(--tokyo-text)]"
                  onClick={(event) => {
                    event.stopPropagation();
                    setReplyOpen(false);
                    setReplyText("");
                  }}
                >
                  <span className="terminal-token-command">&gt;</span>{" "}
                  <span className="terminal-token-key">cancel</span>
                </button>
                <button
                  type="button"
                  className="terminal-btn terminal-action px-2.5 py-1 text-[11px] text-[var(--tokyo-prompt)] disabled:opacity-50"
                  onClick={(event) => {
                    event.stopPropagation();
                    submitReply();
                  }}
                  disabled={!replyText.trim()}
                >
                  <span className="terminal-token-command">&gt;</span>{" "}
                  <span className="terminal-token-flag">send_reply</span>
                </button>
              </div>
            </div>
          )}
          {error && (
            <p className="mt-1 text-xs text-[var(--tokyo-alert)]">
              error: {error}
            </p>
          )}
        </div>
      </div>

      {hasChildren && (
        <div
          className={cn(
            "grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out",
            open
              ? "mt-2 grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="min-h-0 space-y-2">
            {node.replies.map((child, index) => (
              <CommentNode
                key={child.id}
                node={child}
                depth={depth + 1}
                isLast={index === node.replies.length - 1}
                postId={postId}
                onRefresh={onRefresh}
                onThreadLikeDelta={onThreadLikeDelta}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function CommentThread({ postId, onThreadLikeDelta }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadComments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const payload = await commentsApi.listByPost(postId);
      setComments(payload);
    } catch (err) {
      setError(err.message || "Failed to load comments.");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const submitRootComment = async () => {
    const content = newComment.trim();
    if (!content) return;
    setSubmitting(true);
    setError("");
    try {
      await commentsApi.create({ post: postId, content });
      setNewComment("");
      await loadComments();
    } catch (err) {
      setError(err.message || "Unable to add comment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="border border-[var(--tokyo-muted)] bg-[var(--tokyo-void)] p-3">
        <p className="terminal-prompt mb-1 text-xs text-[var(--tokyo-muted)]">
          <span className="terminal-token-flag">reply_to_post</span>
          <span className="terminal-token-meta">(</span>
          <span className="terminal-token-number">{postId}</span>
          <span className="terminal-token-meta">):</span>
        </p>
        <textarea
          value={newComment}
          onChange={(event) => setNewComment(event.target.value)}
          className="terminal-textarea min-h-[76px] w-full resize-none px-2 py-2 text-sm outline-none"
          placeholder="type comment..."
        />
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            className="terminal-btn terminal-action px-3 py-1 text-xs font-semibold text-[var(--tokyo-prompt)] disabled:opacity-50"
            onClick={submitRootComment}
            disabled={!newComment.trim() || submitting}
          >
            {submitting ? (
              "posting..."
            ) : (
              <>
                <span className="terminal-token-command">&gt;</span>{" "}
                <span className="terminal-token-flag">comment</span>
                <span className="terminal-token-meta">()</span>
              </>
            )}
          </button>
        </div>
      </div>

      {loading && (
        <p className="text-xs text-[var(--tokyo-muted)]">loading comments...</p>
      )}
      {!loading && error && (
        <p className="text-xs text-[var(--tokyo-alert)]">error: {error}</p>
      )}
      {!loading && !error && comments.length === 0 && (
        <p className="text-xs text-[var(--tokyo-muted)]">no comments yet</p>
      )}

      {!loading &&
        !error &&
        comments.map((comment, index) => (
          <CommentNode
            key={comment.id}
            node={comment}
            depth={0}
            isLast={index === comments.length - 1}
            postId={postId}
            onRefresh={loadComments}
            onThreadLikeDelta={onThreadLikeDelta}
          />
        ))}
    </div>
  );
}
