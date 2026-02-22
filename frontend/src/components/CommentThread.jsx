import { cva } from "class-variance-authority";
import { MessageCircle, Heart } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "../lib/utils";
import { commentsApi, likesApi } from "../api";

const nodeClass = cva("relative");
const actionButtonClass = cva(
  "group inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs text-[#71767B] transition-colors hover:bg-white/10 hover:text-white",
);

function CommentNode({ node, depth, postId, onRefresh }) {
  const [liked, setLiked] = useState(false);
  const [likeId, setLikeId] = useState(null);
  const [open, setOpen] = useState(true);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [error, setError] = useState("");
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
    try {
      if (liked && likeId) {
        await likesApi.deleteCommentLike(likeId);
        setLiked(false);
        setLikeId(null);
      } else {
        const payload = await likesApi.createCommentLike(node.id);
        setLiked(true);
        setLikeId(payload.id);
      }
    } catch (err) {
      setError(err.message || "Unable to update comment like.");
    }
  };

  return (
    <div className={cn(nodeClass(), depth > 0 && "pl-4")}>
      <div className={cn(depth > 0 && "border-l border-[#2F3336] pl-3")}>
        <div className="flex gap-2.5">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-[10px] font-semibold text-white">
            {node.author.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-1 text-sm leading-5">
              <span className="font-bold text-white">@{node.author}</span>
              <span className="text-[#71767B]">·</span>
              <span className="text-[#71767B]">
                {new Date(node.created).toLocaleString()}
              </span>
            </div>
            <p className="text-sm font-medium text-white">{node.content}</p>
            <div className="mt-1.5 flex items-center gap-1">
              <button
                type="button"
                className={actionButtonClass()}
                onClick={(event) => {
                  event.stopPropagation();
                  setReplyOpen((value) => !value);
                }}
              >
                <MessageCircle size={14} />
                <span>Reply</span>
              </button>
              <button
                type="button"
                className={cn(
                  actionButtonClass(),
                  liked && "text-[#F91880] hover:text-[#F91880]",
                )}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleLike();
                }}
                aria-pressed={liked}
              >
                <Heart size={14} fill={liked ? "#F91880" : "transparent"} />
                <span>{liked ? "Liked" : "Like"}</span>
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
                  <span>
                    {open
                      ? "Hide replies"
                      : `Show ${childCount} repl${childCount === 1 ? "y" : "ies"}`}
                  </span>
                </button>
              )}
            </div>

            {replyOpen && (
              <div className="mt-2 rounded-xl border border-[#2F3336] p-2.5">
                <textarea
                  value={replyText}
                  onChange={(event) => setReplyText(event.target.value)}
                  className="min-h-[66px] w-full resize-none bg-transparent text-xs text-white outline-none placeholder:text-[#71767B]"
                  placeholder="Post your reply"
                />
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-full px-2.5 py-1 text-[11px] font-semibold text-[#71767B] transition-colors hover:bg-white/10 hover:text-white"
                    onClick={(event) => {
                      event.stopPropagation();
                      setReplyOpen(false);
                      setReplyText("");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="rounded-full bg-[#1D9BF0] px-2.5 py-1 text-[11px] font-bold text-white disabled:opacity-50"
                    onClick={(event) => {
                      event.stopPropagation();
                      submitReply();
                    }}
                    disabled={!replyText.trim()}
                  >
                    Reply
                  </button>
                </div>
              </div>
            )}
            {error && <p className="mt-1 text-xs text-red-300">{error}</p>}
          </div>
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
            {node.replies.map((child) => (
              <CommentNode
                key={child.id}
                node={child}
                depth={depth + 1}
                postId={postId}
                onRefresh={onRefresh}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function CommentThread({ postId }) {
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
    <div className="mt-3 space-y-3">
      <div className="rounded-2xl border border-[#2F3336] p-3">
        <textarea
          value={newComment}
          onChange={(event) => setNewComment(event.target.value)}
          className="min-h-[76px] w-full resize-none bg-transparent text-sm text-white outline-none placeholder:text-[#71767B]"
          placeholder="Write a comment"
        />
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            className="rounded-full bg-[#1D9BF0] px-3 py-1 text-xs font-bold text-white disabled:opacity-50"
            onClick={submitRootComment}
            disabled={!newComment.trim() || submitting}
          >
            {submitting ? "Posting..." : "Comment"}
          </button>
        </div>
      </div>

      {loading && <p className="text-xs text-zinc-400">Loading comments...</p>}
      {!loading && error && <p className="text-xs text-red-300">{error}</p>}
      {!loading && !error && comments.length === 0 && (
        <p className="text-xs text-zinc-400">No comments yet.</p>
      )}

      {!loading &&
        !error &&
        comments.map((comment) => (
          <CommentNode
            key={comment.id}
            node={comment}
            depth={0}
            postId={postId}
            onRefresh={loadComments}
          />
        ))}
    </div>
  );
}
