import { cva } from "class-variance-authority";
import { useMemo } from "react";
import { cn } from "../lib/utils";
import { feedPosts } from "./feedData";

const railClass = cva(
  "sticky top-0 h-screen border-l border-white/10 bg-[#060B13]/40 px-6 py-4",
);
const cardClass = cva(
  "mt-3 rounded-2xl border border-white/10 bg-[#111827]/65 p-4 shadow-lg shadow-black/20 backdrop-blur",
);

function buildLeaderboard(posts) {
  const totals = new Map();

  for (const post of posts) {
    totals.set(post.author.handle, (totals.get(post.author.handle) || 0) + 5);

    const stack = [...post.comments];
    while (stack.length > 0) {
      const current = stack.pop();
      totals.set(
        current.author.handle,
        (totals.get(current.author.handle) || 0) + 1,
      );
      stack.push(...current.children);
    }
  }

  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([handle, score]) => ({ handle, score }));
}

export function LeaderboardCard({ className }) {
  const leaderboard = useMemo(() => buildLeaderboard(feedPosts), []);

  return (
    <div className={cn(cardClass(), className)}>
      <h2 className="text-xl font-extrabold text-white">Top Karma • 24h</h2>
      <ul className="mt-4 space-y-3">
        {leaderboard.map((entry, index) => (
          <li
            key={entry.handle}
            className="flex items-center justify-between rounded-xl px-2 py-1.5 transition-colors hover:bg-white/5"
          >
            <div className="flex items-center gap-3">
              <span className="w-5 text-sm font-semibold text-[#71767B]">
                {index + 1}
              </span>
              <span className="text-[15px] font-semibold text-white">
                @{entry.handle}
              </span>
            </div>
            <span className="text-sm font-semibold text-[#1D9BF0]">
              {entry.score}
            </span>
          </li>
        ))}
      </ul>
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
