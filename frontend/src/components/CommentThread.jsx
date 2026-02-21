import { cva } from "class-variance-authority";
import { MessageCircle, Heart } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";

const nodeClass = cva("relative");
const actionButtonClass = cva(
  "group inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs text-[#71767B] transition-colors hover:bg-white/10 hover:text-white",
);

export function CommentThread({ comment, depth }) {
  const [liked, setLiked] = useState(false);
  const [open, setOpen] = useState(false);
  const [children, setChildren] = useState(comment.children);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const hasChildren = children.length > 0;
  const childCount = children.length;

  const submitReply = () => {
    const value = replyText.trim();
    if (!value) {
      return;
    }

    setChildren((current) => [
      ...current,
      {
        id: `c-${comment.id}-${Date.now()}`,
        author: { name: "You", handle: "you", avatar: "YOU" },
        timestamp: "now",
        text: value,
        children: [],
      },
    ]);
    setReplyText("");
    setReplyOpen(false);
    setOpen(true);
  };

  return (
    <div className={cn(nodeClass(), depth > 0 && "pl-4")}>
      <div className={cn(depth > 0 && "border-l border-[#2F3336] pl-3")}>
        <div className="flex gap-2.5">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-[10px] font-semibold text-white">
            {comment.author.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-1 text-sm leading-5">
              <span className="font-bold text-white">
                {comment.author.name}
              </span>
              <span className="text-[#71767B]">@{comment.author.handle}</span>
              <span className="text-[#71767B]">·</span>
              <span className="text-[#71767B]">{comment.timestamp}</span>
            </div>
            <p className="text-sm font-medium text-white">{comment.text}</p>
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
                  setLiked((value) => !value);
                }}
                aria-pressed={liked}
              >
                <Heart size={14} fill={liked ? "#F91880" : "transparent"} />
                <span>Like</span>
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
            {children.map((child) => (
              <CommentThread key={child.id} comment={child} depth={depth + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
