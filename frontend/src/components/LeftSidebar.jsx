import { cva } from "class-variance-authority";
import { House, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";

const railClass = cva(
  "sticky top-0 flex h-full min-h-[calc(100vh-4.2rem)] flex-col items-center justify-between border-r border-[var(--tokyo-muted)] bg-[var(--tokyo-void)] px-3 py-4",
);
const navClass = cva("flex w-full flex-col items-center gap-2");
const iconButtonClass = cva(
  "terminal-btn terminal-action flex h-11 w-11 items-center justify-center text-[var(--tokyo-prompt)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--tokyo-prompt)]",
);

export function LeftSidebar({ onSignOut }) {
  const navigate = useNavigate();

  return (
    <aside className={railClass()}>
      <div className={navClass()}>
        <div className="mb-3 flex h-11 w-11 items-center justify-center overflow-hidden rounded-sm border border-[var(--tokyo-muted)] bg-[var(--tokyo-surface)]">
          <img
            src="/favicon.ico"
            alt="Playto logo"
            className="h-7 w-7 object-contain"
          />
        </div>
        <button
          type="button"
          className={cn(iconButtonClass(), "text-[var(--tokyo-prompt)]")}
          aria-label="Home"
          onClick={() => navigate("/home")}
        >
          <House size={20} strokeWidth={2} />
        </button>
      </div>
      <div className="flex w-full flex-col items-center gap-2">
        <button
          type="button"
          className={cn(
            iconButtonClass(),
            "h-10 w-10 text-[var(--tokyo-muted)]",
          )}
          aria-label="Sign out"
          onClick={onSignOut}
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
