import { cva } from "class-variance-authority";
import { useEffect, useState } from "react";
import { cn } from "../lib/utils";
import { usersApi } from "../api";

const railClass = cva(
  "sticky top-0 h-full min-h-[calc(100vh-4.2rem)] border-l border-[var(--tokyo-muted)] bg-[var(--tokyo-void)] px-5 py-4",
);
const cardClass = cva(
  "mt-3 border border-[var(--tokyo-muted)] bg-[var(--tokyo-surface)] p-4",
);

export function LeaderboardCard({ className }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadLeaderboard = async () => {
      setLoading(true);
      setError("");
      try {
        const payload = await usersApi.getKarmaLeaderboard24h();
        if (!isMounted) {
          return;
        }
        setLeaderboard(payload?.top_users || []);
      } catch (err) {
        if (!isMounted) {
          return;
        }
        setError(err.message || "Failed to load leaderboard.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadLeaderboard();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className={cn(cardClass(), className)}>
      <h2 className="text-sm font-bold tracking-[0.08em] text-[var(--tokyo-prompt)]">
        +-- TOP_KARMA_24H
      </h2>

      {loading && (
        <p className="mt-4 text-sm text-[var(--tokyo-muted)]">loading...</p>
      )}

      {!loading && error && (
        <p className="mt-4 text-sm text-[var(--tokyo-alert)]">{error}</p>
      )}

      {!loading && !error && leaderboard.length === 0 && (
        <p className="mt-4 text-sm text-[var(--tokyo-muted)]">
          no activity in the last 24h
        </p>
      )}

      {!loading && !error && leaderboard.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {leaderboard.map((entry, index) => (
            <li
              key={entry.user_id}
              className="terminal-action flex items-center justify-between border border-transparent px-2 py-1"
            >
              <div className="flex items-center gap-3">
                <span className="w-5 text-sm font-semibold text-[var(--tokyo-muted)]">
                  {index + 1}
                </span>
                <span className="text-sm font-semibold text-[var(--tokyo-text)]">
                  @{entry.username}
                </span>
              </div>
              <span className="text-sm font-semibold text-[var(--tokyo-alert)]">
                {entry.karma}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function RightSidebar() {
  return (
    <aside className={railClass()}>
      <LeaderboardCard />
    </aside>
  );
}
