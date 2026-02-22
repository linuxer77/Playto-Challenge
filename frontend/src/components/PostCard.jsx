import { cva } from "class-variance-authority";
import { Heart, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";
import { likesApi } from "../api";
import { CommentThread } from "./CommentThread";

const cardClass = cva(
  "border-b border-[#2F3336] px-4 py-3 transition-colors hover:bg-white/5",
);
const actionButtonClass = cva(
  "group inline-flex items-center gap-2 rounded-full px-2 py-1 text-[#71767B] transition-colors hover:bg-white/10 hover:text-white",
);

export function PostCard({ post, expanded = false }) {
  const [liked, setLiked] = useState(false);
  const [likeId, setLikeId] = useState(null);
  const [likeError, setLikeError] = useState("");
  const [likeLoading, setLikeLoading] = useState(false);
  const navigate = useNavigate();

  const toggleLike = async () => {
    setLikeError("");
    setLikeLoading(true);
    try {
      if (liked && likeId) {
        await likesApi.deletePostLike(likeId);
        setLiked(false);
        setLikeId(null);
      } else {
        const payload = await likesApi.createPostLike(post.id);
        setLiked(true);
        setLikeId(payload.id);
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
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-xs font-semibold text-white">
          U{post.author}
        </div>

        <div className="min-w-0 flex-1">
          <header className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[15px] leading-5">
            <span className="font-bold text-white">@user-{post.author}</span>
            <span className="text-[#71767B]">·</span>
            <span className="text-[#71767B]">
              {new Date(post.date).toLocaleString()}
            </span>
          </header>

          <p className="mt-1 text-sm font-semibold text-zinc-200">
            {post.title}
          </p>
          <p className="mt-1.5 whitespace-pre-wrap text-[15px] font-medium text-white">
            {post.content}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              className={actionButtonClass()}
              onClick={(event) => {
                event.stopPropagation();
                if (!expanded) {
                  navigate(`/posts/${post.id}`);
                }
              }}
            >
              <MessageCircle size={17} />
              <span className="text-sm">Comments</span>
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
              disabled={likeLoading}
            >
              <Heart size={17} fill={liked ? "#F91880" : "transparent"} />
              <span className="text-sm">{liked ? "Liked" : "Like"}</span>
            </button>
          </div>

          {likeError && (
            <p className="mt-2 text-xs text-red-300">{likeError}</p>
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
              <CommentThread postId={post.id} />
            </div>
          </section>
        </div>
      </div>
    </article>
  );
}
