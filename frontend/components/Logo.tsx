export default function Logo({ mono = false }: { mono?: boolean }) {
  return (
    <div className="inline-flex items-center gap-2 select-none">
      <span
        className={`relative flex h-7 w-7 items-center justify-center rounded-full border-2 text-[10px] font-bold font-mono ${
          mono
            ? "border-paper text-paper"
            : "border-paprika text-paprika"
        }`}
        aria-hidden
      >
        AI
      </span>
      <span className={`font-display text-lg font-semibold tracking-tight ${mono ? "text-paper" : "text-ink"}`}>
        GenReview
      </span>
    </div>
  );
}
