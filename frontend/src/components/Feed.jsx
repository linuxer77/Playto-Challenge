import { cva } from "class-variance-authority";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { postsApi } from "../api";
import { PostCard } from "./PostCard";
import { Composer } from "./Composer";

const containerClass = cva(
  "h-screen overflow-y-auto border-x border-white/10 bg-[#050A12]/40",
);
const tabButtonClass = cva(
  "relative flex-1 py-4 text-[15px] font-semibold transition-colors hover:bg-white/5",
  {
    variants: {
      active: {
        true: "text-white",
        false: "text-[#71767B]",
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
      <div className="sticky top-0 z-10 border-b border-white/10 bg-[#050A12]/90 backdrop-blur-xl">
        {isDetailView ? (
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
              onClick={() => navigate("/home")}
              aria-label="Back to feed"
            >
              ←
            </button>
            <div>
              <p className="text-xl font-bold text-white">Post</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex">
              <button
                type="button"
                className={tabButtonClass({ active: true })}
              >
                Feed
              </button>
            </div>
            <Composer onPostCreated={loadData} />
          </>
        )}
      </div>

      <div>
        {loading && (
          <p className="px-4 py-6 text-sm text-zinc-300">Loading...</p>
        )}

        {!loading && error && (
          <div className="px-4 py-6">
            <p className="text-sm text-red-300">{error}</p>
            <button
              type="button"
              onClick={loadData}
              className="mt-3 rounded-full border border-white/20 px-3 py-1.5 text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && isDetailView && currentPost && (
          <PostCard key={currentPost.id} post={currentPost} expanded />
        )}

        {!loading && !error && !isDetailView && posts.length === 0 && (
          <p className="px-4 py-6 text-sm text-zinc-400">No posts yet.</p>
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
