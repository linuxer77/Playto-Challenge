import { cva } from "class-variance-authority";
import { Image, SmilePlus, CalendarDays, MapPin } from "lucide-react";
import { useState } from "react";
import { postsApi } from "../api";

const wrapperClass = cva("border-b border-[#2F3336] px-4 pb-3 pt-4");
const iconButtonClass = cva(
  "flex h-8 w-8 items-center justify-center rounded-full text-[#1D9BF0] transition-colors hover:bg-white/10",
);

export function Composer({ onPostCreated }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submitPost = async () => {
    const payload = { title: title.trim(), content: content.trim() };
    if (!payload.title || !payload.content) {
      setError("Title and content are required.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await postsApi.create(payload);
      setTitle("");
      setContent("");
      if (onPostCreated) {
        await onPostCreated();
      }
    } catch (err) {
      setError(err.message || "Unable to create post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={wrapperClass()}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-700 text-xs font-semibold text-white">
          YOU
        </div>
        <div className="min-w-0 flex-1">
          <input
            className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white"
            placeholder="Post title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <textarea
            className="mt-2 min-h-[90px] w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white"
            placeholder="What's happening?"
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
          {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                type="button"
                className={iconButtonClass()}
                aria-label="Add image"
              >
                <Image size={18} />
              </button>
              <button
                type="button"
                className={iconButtonClass()}
                aria-label="Add emoji"
              >
                <SmilePlus size={18} />
              </button>
              <button
                type="button"
                className={iconButtonClass()}
                aria-label="Schedule post"
              >
                <CalendarDays size={18} />
              </button>
              <button
                type="button"
                className={iconButtonClass()}
                aria-label="Add location"
              >
                <MapPin size={18} />
              </button>
            </div>
            <button
              type="button"
              className="rounded-full bg-[#1D9BF0] px-5 py-2 text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-60"
              onClick={submitPost}
              disabled={loading}
            >
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
