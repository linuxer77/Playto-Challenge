import { cva } from "class-variance-authority";
import { Image, SmilePlus, CalendarDays, MapPin } from "lucide-react";

const wrapperClass = cva("border-b border-[#2F3336] px-4 pb-3 pt-4");
const iconButtonClass = cva(
  "flex h-8 w-8 items-center justify-center rounded-full text-[#1D9BF0] transition-colors hover:bg-white/10",
);

export function Composer() {
  return (
    <section className={wrapperClass()}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-700 text-xs font-semibold text-white">
          YOU
        </div>
        <div className="min-w-0 flex-1">
          <p className="pt-1 text-[22px] font-medium text-[#71767B]">
            What&apos;s happening?
          </p>
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
              className="rounded-full bg-[#1D9BF0] px-5 py-2 text-sm font-bold text-white transition-all hover:brightness-110"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
