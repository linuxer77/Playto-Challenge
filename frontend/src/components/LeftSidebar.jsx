import { cva } from "class-variance-authority";
import { CircleUserRound, House, Search, Bell, LogOut } from "lucide-react";
import { cn } from "../lib/utils";

const railClass = cva(
  "sticky top-0 flex h-screen flex-col items-center justify-between border-r border-white/10 bg-[#060B13]/60 px-3 py-4 backdrop-blur",
);
const navClass = cva("flex w-full flex-col items-center gap-2");
const iconButtonClass = cva(
  "flex h-12 w-12 items-center justify-center rounded-full text-[#E7E9EA] transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60",
);
const postButtonClass = cva(
  "mb-5 flex h-12 w-full max-w-[66px] items-center justify-center rounded-full bg-[#1D9BF0] text-white transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D9BF0]",
);

const navItems = [
  { icon: House, active: true },
  { icon: Search, active: false },
  { icon: Bell, active: false },
  { icon: CircleUserRound, active: false },
];

export function LeftSidebar({ onSignOut }) {
  return (
    <aside className={railClass()}>
      <div className={navClass()}>
        <div className="mb-1 text-3xl font-semibold text-white">X</div>
        {navItems.map(({ icon: Icon, active }) => (
          <button
            key={Icon.displayName || Icon.name}
            type="button"
            className={cn(iconButtonClass(), active && "text-white")}
            aria-label={Icon.name}
          >
            <Icon size={26} strokeWidth={2.2} />
          </button>
        ))}
      </div>
      <div className="flex w-full flex-col items-center gap-2">
        <button type="button" className={postButtonClass()} aria-label="Post">
          <span className="text-base font-bold">Post</span>
        </button>

        <button
          type="button"
          className={cn(iconButtonClass(), "h-10 w-10 text-slate-300")}
          aria-label="Sign out"
          onClick={onSignOut}
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
