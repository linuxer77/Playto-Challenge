import { X, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { LeftSidebar } from "./LeftSidebar";
import { Feed } from "./Feed";
import { LeaderboardCard, RightSidebar } from "./RightSidebar";

export function Layout() {
  const { logout } = useAuth();
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const { postId } = useParams();

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1280px)");
    const onChange = (event) => {
      if (event.matches) {
        setLeaderboardOpen(false);
      }
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--tokyo-void)] px-3 py-3 text-[var(--tokyo-text)] sm:px-4">
      <div className="terminal-shell mx-auto min-h-[calc(100vh-1.5rem)] max-w-[1320px]">
        <div className="terminal-chrome flex items-center justify-between px-4 py-2 text-xs">
          <span className="tracking-[0.12em]">
            <span className="terminal-token-command">PLAYTO</span>
            <span className="terminal-token-meta">://</span>
            <span className="terminal-token-key">SESSION</span>
          </span>
          <span className="text-[var(--tokyo-muted)]">
            STATUS: <span className="terminal-token-flag">ONLINE</span>
          </span>
        </div>
        <div className="grid min-h-[calc(100vh-4.2rem)] grid-cols-1 md:grid-cols-[84px_minmax(0,1fr)] xl:grid-cols-[84px_minmax(0,640px)_360px]">
          <div className="hidden md:block">
            <LeftSidebar onSignOut={logout} />
          </div>
          <Feed postId={postId} />
          <div className="hidden xl:block">
            <RightSidebar />
          </div>
        </div>
      </div>

      <button
        type="button"
        className="terminal-btn terminal-action fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[var(--tokyo-prompt)] xl:hidden"
        onClick={() => setLeaderboardOpen(true)}
      >
        <Trophy size={16} />
        <span className="terminal-token-command">&gt;</span>{" "}
        <span className="terminal-token-flag">top_users</span>
      </button>

      <div
        className={[
          "fixed inset-0 z-40 transition-all duration-200 xl:hidden",
          leaderboardOpen
            ? "pointer-events-auto bg-black/60 opacity-100"
            : "pointer-events-none bg-black/0 opacity-0",
        ].join(" ")}
        onClick={() => setLeaderboardOpen(false)}
        aria-hidden={!leaderboardOpen}
      >
        <aside
          className={[
            "terminal-shell absolute bottom-0 right-0 h-[min(82vh,640px)] w-full max-w-md p-4 transition-transform duration-300",
            leaderboardOpen ? "translate-y-0" : "translate-y-full",
          ].join(" ")}
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Leaderboard"
        >
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--tokyo-text)]">
              <span className="terminal-token-command">&gt;</span>{" "}
              <span className="terminal-token-flag">top_users</span>{" "}
              <span className="terminal-token-meta">--24h</span>
            </h2>
            <button
              type="button"
              className="terminal-action inline-flex h-9 w-9 items-center justify-center border border-[var(--tokyo-muted)] text-[var(--tokyo-muted)]"
              onClick={() => setLeaderboardOpen(false)}
              aria-label="Close leaderboard"
            >
              <X size={18} />
            </button>
          </div>
          <div className="max-h-[calc(82vh-48px)] overflow-y-auto pr-1">
            <LeaderboardCard className="mt-0" />
          </div>
        </aside>
      </div>
    </div>
  );
}
