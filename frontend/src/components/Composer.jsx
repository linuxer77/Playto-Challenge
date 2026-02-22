import { cva } from "class-variance-authority";
import { useState } from "react";
import { postsApi } from "../api";

const wrapperClass = cva("border-b border-[var(--tokyo-muted)] px-4 pb-3 pt-4");

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
        <div className="flex h-10 w-10 items-center justify-center border border-[var(--tokyo-muted)] bg-[var(--tokyo-surface)] text-xs font-semibold text-[var(--tokyo-prompt)]">
          YOU
        </div>
        <div className="min-w-0 flex-1">
          <p className="terminal-prompt mb-1 text-xs text-[var(--tokyo-muted)]">
            <span className="terminal-token-meta">post_</span>
            <span className="terminal-token-key">title</span>
          </p>
          <input
            className="terminal-input w-full px-3 py-2 text-sm"
            placeholder="Post title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <p className="terminal-prompt mb-1 mt-2 text-xs text-[var(--tokyo-muted)]">
            <span className="terminal-token-meta">post_</span>
            <span className="terminal-token-key">body</span>
          </p>
          <textarea
            className="terminal-textarea min-h-[90px] w-full px-3 py-2 text-sm"
            placeholder="What's happening?"
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
          {error && (
            <p className="mt-2 text-xs text-[var(--tokyo-alert)]">
              error: {error}
            </p>
          )}
          <div className="mt-4 flex items-center justify-between">
            <span className="terminal-prompt text-xs text-[var(--tokyo-muted)]">
              <span className="terminal-token-meta">ready_to_</span>
              <span className="terminal-token-flag">submit</span>
            </span>
            <button
              type="button"
              className="terminal-btn terminal-action px-4 py-2 text-sm font-bold text-[var(--tokyo-prompt)] disabled:opacity-60"
              onClick={submitPost}
              disabled={loading}
            >
              {loading ? (
                "posting..."
              ) : (
                <>
                  <span className="terminal-token-command">&gt;</span>{" "}
                  <span className="terminal-token-flag">submit_post</span>
                  <span className="terminal-token-meta">()</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
