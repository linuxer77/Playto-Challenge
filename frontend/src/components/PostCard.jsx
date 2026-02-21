import { cva } from "class-variance-authority";
import { Heart, MessageCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";
import { CommentThread } from "./CommentThread";

const cardClass = cva(
  "border-b border-[#2F3336] px-4 py-3 transition-colors hover:bg-white/5",
);
const actionButtonClass = cva(
  "group inline-flex items-center gap-2 rounded-full px-2 py-1 text-[#71767B] transition-colors hover:bg-white/10 hover:text-white",
);

function countComments(comments) {
  let total = 0;
  const stack = [...comments];
  while (stack.length > 0) {
    const current = stack.pop();
    total += 1;
    stack.push(...current.children);
  }
  return total;
}

export function PostCard({ post, expanded = false }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [comments, setComments] = useState(post.comments);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const navigate = useNavigate();
  const totalComments = useMemo(() => countComments(comments), [comments]);

  const toggleLike = () => {
    setLiked((current) => {
      const next = !current;
      setLikeCount((count) => count + (next ? 1 : -1));
      return next;
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!expanded) {
        navigate(`/${post.id}`);
      }
    }
  };

  const openPostDetail = () => {
    if (!expanded) {
      navigate(`/${post.id}`);
    }
  };

  const submitReply = () => {
    const value = replyText.trim();
    if (!value) {
      return;
    }

    setComments((current) => [
      ...current,
      {
        id: `c-${Date.now()}`,
        author: { name: "You", handle: "you", avatar: "YOU" },
        timestamp: "now",
        text: value,
        children: [],
      },
    ]);
    setReplyText("");
    setReplyOpen(false);
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
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-xs font-semibold text-white">
          {post.author.avatar}
        </div>

        <div className="min-w-0 flex-1">
          <header className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[15px] leading-5">
            <span className="font-bold text-white">{post.author.name}</span>
            <span className="text-[#71767B]">@{post.author.handle}</span>
            <span className="text-[#71767B]">·</span>
            <span className="text-[#71767B]">{post.timestamp}</span>
          </header>

          <p className="mt-1.5 whitespace-pre-wrap text-[15px] font-medium text-white">
            {post.text}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              className={actionButtonClass()}
              onClick={(event) => {
                event.stopPropagation();
                if (!expanded) {
                  navigate(`/${post.id}`);
                }
              }}
            >
              <MessageCircle size={17} />
              <span className="text-sm">{totalComments || post.replies}</span>
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
              <Heart size={17} fill={liked ? "#F91880" : "transparent"} />
              <span className="text-sm">{likeCount}</span>
            </button>

            {expanded && (
              <button
                type="button"
                className="ml-1 rounded-full border border-[#2F3336] px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-white/10"
                onClick={(event) => {
                  event.stopPropagation();
                  setReplyOpen((value) => !value);
                }}
              >
                Reply
              </button>
            )}
          </div>

          {expanded && replyOpen && (
            <div
              className="mt-2 rounded-2xl border border-[#2F3336] p-3"
              onClick={(event) => event.stopPropagation()}
            >
              <textarea
                value={replyText}
                onChange={(event) => setReplyText(event.target.value)}
                className="min-h-[76px] w-full resize-none bg-transparent text-sm text-white outline-none placeholder:text-[#71767B]"
                placeholder="Post your reply"
              />
              <div className="mt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="rounded-full px-3 py-1 text-xs font-semibold text-[#71767B] transition-colors hover:bg-white/10 hover:text-white"
                  onClick={() => {
                    setReplyOpen(false);
                    setReplyText("");
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="rounded-full bg-[#1D9BF0] px-3 py-1 text-xs font-bold text-white disabled:opacity-50"
                  onClick={submitReply}
                  disabled={!replyText.trim()}
                >
                  Reply
                </button>
              </div>
            </div>
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
              <div className="space-y-3 pb-1">
                {comments.map((comment) => (
                  <CommentThread key={comment.id} comment={comment} depth={0} />
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </article>
  );
}
