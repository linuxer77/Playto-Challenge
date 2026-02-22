import { cva } from "class-variance-authority";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { postsApi } from "../api";
import { PostCard } from "./PostCard";
import { Composer } from "./Composer";

const containerClass = cva(
  "h-full min-h-[calc(100vh-4.2rem)] overflow-y-auto border-x border-[var(--tokyo-muted)] bg-[var(--tokyo-void)]",
);
const tabButtonClass = cva(
  "terminal-action relative flex-1 border-b border-[var(--tokyo-muted)] px-5 py-3 text-left text-sm font-semibold tracking-[0.08em]",
  {
    variants: {
      active: {
        true: "text-[var(--tokyo-prompt)]",
        false: "text-[var(--tokyo-muted)]",
      },
    },
    defaultVariants: {
      active: false,
    },
  },
);

export function Feed({ postId }) {
  const [posts, setPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const isDetailView = Boolean(postId);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (isDetailView) {
        const payload = await postsApi.get(postId);
        setCurrentPost(payload);
      } else {
        const payload = await postsApi.list();
        setPosts(payload);
      }
    } catch (err) {
      setError(err.message || "Failed to load posts.");
    } finally {
      setLoading(false);
    }
  }, [isDetailView, postId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <main className={containerClass()}>
      <div className="terminal-chrome sticky top-0 z-10 border-b border-[var(--tokyo-muted)] bg-[var(--tokyo-void)]">
        {isDetailView ? (
          <div className="flex items-center gap-3 px-5 py-3">
            <button
              type="button"
              className="terminal-btn terminal-action inline-flex h-8 w-8 items-center justify-center text-[var(--tokyo-prompt)]"
              onClick={() => navigate("/home")}
              aria-label="Back to feed"
            >
              ←
            </button>
            <div>
              <p className="terminal-prompt text-sm font-semibold tracking-[0.08em] text-[var(--tokyo-prompt)]">
                <span className="terminal-token-flag">read_post</span>
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex">
              <button
                type="button"
                className={tabButtonClass({ active: true })}
              >
                <span className="terminal-token-key">root</span>
                <span className="text-[var(--tokyo-muted)]">@</span>
                <span className="terminal-token-meta">feed</span>
                <span className="text-[var(--tokyo-muted)]">:~$ </span>
                <span className="terminal-token-flag">ls</span>
                <span className="text-[var(--tokyo-muted)]"> </span>
                <span className="terminal-token-meta">posts</span>
              </button>
            </div>
            <Composer onPostCreated={loadData} />
          </>
        )}
      </div>

      <div className="px-2 pb-16 pt-2">
        {loading && (
          <p className="px-4 py-8 text-sm text-[var(--tokyo-muted)]">
            loading...
          </p>
        )}

        {!loading && error && (
          <div className="px-4 py-8">
            <p className="text-sm text-[var(--tokyo-alert)]">error: {error}</p>
            <button
              type="button"
              onClick={loadData}
              className="terminal-btn terminal-action mt-3 px-3 py-1 text-sm"
            >
              {"> retry()"}
            </button>
          </div>
        )}

        {!loading && !error && isDetailView && currentPost && (
          <PostCard key={currentPost.id} post={currentPost} expanded />
        )}

        {!loading && !error && !isDetailView && posts.length === 0 && (
          <p className="px-4 py-8 text-sm text-[var(--tokyo-muted)]">
            no posts found
          </p>
        )}

        {!loading &&
          !error &&
          !isDetailView &&
          posts.map((post) => (
            <PostCard key={post.id} post={post} expanded={false} />
          ))}
      </div>
    </main>
  );
}
