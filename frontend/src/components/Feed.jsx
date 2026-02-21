import { cva } from "class-variance-authority";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";
import { feedPosts } from "./feedData";
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
  const [activeTab, setActiveTab] = useState("for-you");
  const navigate = useNavigate();

  useEffect(() => {
    console.info("Initializing nested layout engine for thread depth...");
  }, []);

  const visiblePosts = useMemo(() => {
    if (activeTab === "following") {
      return feedPosts.filter(
        (post) =>
          post.author.handle === "arikim" || post.author.handle === "sofiaw",
      );
    }
    return feedPosts;
  }, [activeTab]);

  const selectedPost = useMemo(
    () => feedPosts.find((post) => post.id === postId) ?? null,
    [postId],
  );

  const isDetailView = Boolean(postId);

  const postsToRender = useMemo(() => {
    if (isDetailView) {
      return selectedPost ? [selectedPost] : [];
    }
    return visiblePosts;
  }, [isDetailView, selectedPost, visiblePosts]);

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
              {selectedPost && (
                <p className="text-xs text-[#71767B]">@{selectedPost.author.handle}</p>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="flex">
              <button
                type="button"
                className={tabButtonClass({ active: activeTab === "for-you" })}
                onClick={() => setActiveTab("for-you")}
              >
                For you
                <span
                  className={cn(
                    "absolute bottom-0 left-1/2 h-1 w-14 -translate-x-1/2 rounded-full bg-[#1D9BF0] transition-opacity",
                    activeTab === "for-you" ? "opacity-100" : "opacity-0",
                  )}
                />
              </button>
              <button
                type="button"
                className={tabButtonClass({ active: activeTab === "following" })}
                onClick={() => setActiveTab("following")}
              >
                Following
                <span
                  className={cn(
                    "absolute bottom-0 left-1/2 h-1 w-14 -translate-x-1/2 rounded-full bg-[#1D9BF0] transition-opacity",
                    activeTab === "following" ? "opacity-100" : "opacity-0",
                  )}
                />
              </button>
            </div>
            <Composer />
          </>
        )}
      </div>

      <div>
        {postsToRender.map((post) => (
          <PostCard key={post.id} post={post} expanded={isDetailView} />
        ))}
        {isDetailView && !selectedPost && (
          <div className="px-4 py-10 text-center">
            <p className="text-lg font-semibold text-white">Post not found</p>
            <button
              type="button"
              className="mt-3 rounded-full bg-[#1D9BF0] px-4 py-2 text-sm font-bold text-white"
              onClick={() => navigate("/home")}
            >
              Go back to feed
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
