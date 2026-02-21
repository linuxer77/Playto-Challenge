import { X, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { LeftSidebar } from "./LeftSidebar";
import { Feed } from "./Feed";
import { LeaderboardCard, RightSidebar } from "./RightSidebar";

export function Layout({ onSignOut }) {
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
    <div className="min-h-screen bg-[#04070C] text-white">
      <div className="mx-auto grid min-h-screen max-w-[1320px] grid-cols-1 md:grid-cols-[88px_minmax(0,1fr)] xl:grid-cols-[88px_minmax(0,640px)_360px]">
        <div className="hidden md:block">
          <LeftSidebar onSignOut={onSignOut} />
        </div>
        <Feed postId={postId} />
        <div className="hidden xl:block">
          <RightSidebar />
        </div>
      </div>

      <button
        type="button"
        className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/90 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/40 backdrop-blur transition-all hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 xl:hidden"
        onClick={() => setLeaderboardOpen(true)}
      >
        <Trophy size={16} />
        Leaderboard
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
            "absolute bottom-0 right-0 h-[min(82vh,640px)] w-full max-w-md rounded-t-2xl border border-white/10 bg-[#0A0A0A] p-4 shadow-2xl shadow-black/60 transition-transform duration-300 sm:rounded-l-2xl sm:rounded-tr-none",
            leaderboardOpen ? "translate-y-0" : "translate-y-full",
          ].join(" ")}
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Leaderboard"
        >
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Leaderboard</h2>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
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
